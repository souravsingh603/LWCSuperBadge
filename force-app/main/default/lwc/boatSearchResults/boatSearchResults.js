import {api, LightningElement, wire} from 'lwc';
import BOATMC from "@salesforce/messageChannel/BoatMessageChannel__c";
import { APPLICATION_SCOPE,subscribe, MessageContext,unsubscribe,publish } from 'lightning/messageService';
import { refreshApex } from "@salesforce/apex";
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { getRecord, getFieldValue,updateRecord  } from 'lightning/uiRecordApi';
import getBoats from '@salesforce/apex/BoatDataService.getBoats';
import updateBoatList from '@salesforce/apex/BoatDataService.updateBoatList';

const SUCCESS_TITLE = 'Success';
const MESSAGE_SHIP_IT     = 'Ship it!';
const SUCCESS_VARIANT     = 'success';
const ERROR_TITLE   = 'Error';
const ERROR_VARIANT = 'error';
export default class BoatSearchResults extends LightningElement {
  selectedBoatId;
  columns = [

    { label: 'Name', fieldName: 'Name', editable: true },
    { label: 'Length', fieldName: 'Length__c', type: 'number', editable: true },
    { label: 'Price', fieldName: 'Price__c', type: 'currency', editable: true },
    { label: 'Description ', fieldName: 'Description__c', editable: true }
  ];
  boatTypeId = '';
  boats;
  isLoading = false;
  
  // wired message context
  @wire(MessageContext)
  messageContext;
  // wired getBoats method 
  @wire(getBoats,{boatTypeId: '$boatTypeId'})
  wiredBoats(result) { 
    if(result.data){
      this.boats = result.data;
    }
    this.notifyLoading(false);
  }
  
  // public function that updates the existing boatTypeId property
  // uses notifyLoading
  @api
  searchBoats(boatTypeId) {
    this.notifyLoading(false);
    this.boatTypeId = boatTypeId;
    if(this.boats){
        this.isLoading = true;
        this.notifyLoading(this.isLoading);
    }
   

   }
  
  // this public function must refresh the boats asynchronously
  // uses notifyLoading
  @api async refresh() { 
    this.notifyLoading(true);
    await refreshApex(this.boats);
    this.notifyLoading(false);
  }
  
  // this function must update selectedBoatId and call sendMessageService
  updateSelectedTile(event) {
    this.selectedBoatId = event.detail.boatId;
    this.sendMessageService(this.selectedBoatId);
   }
  
  // Publishes the selected boat Id on the BoatMC.
  sendMessageService(boatId) { 
    // explicitly pass boatId to the parameter recordId
    publish(this.messageContext, BOATMC, { recordId: boatId});
  }
  
  // The handleSave method must save the changes in the Boat Editor
  // passing the updated fields from draftValues to the 
  // Apex method updateBoatList(Object data).
  // Show a toast message with the title
  // clear lightning-datatable draft values
  async handleSave(event) {
    // notify loading
    this.notifyLoading(true);
    const updatedFields = event.detail.draftValues;
    // Update the records via Apex
    await updateBoatList({data: updatedFields})
    .then((result ) => {
      this.dispatchEvent(
        new ShowToastEvent({
            title: SUCCESS_TITLE,
            message: MESSAGE_SHIP_IT,
            variant: SUCCESS_VARIANT
        })
    );
    this.refresh();
    refreshApex(this.boats).then(() => {
      // Clear all draft values in the datatable
      this.draftValues = [];
    });

    })
    .catch(error => {

      this.dispatchEvent(
        new ShowToastEvent({
            title: ERROR_TITLE,
            message: error.body.message,
            variant: ERROR_VARIANT
        })
    );
    })
    .finally(() => {});
  }
  // Check the current value of isLoading before dispatching the doneloading or loading custom event
  notifyLoading(isLoading) { 
    if(isLoading){
      this.dispatchEvent(new CustomEvent('loading', {
        detail : isLoading
      }));    }
    else{
      this.dispatchEvent(new CustomEvent('doneloading', {
        detail : isLoading
      }));
    }
   

  }
}
