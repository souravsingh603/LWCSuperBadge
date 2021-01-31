
// Custom Labels Imports
// import labelDetails for Details
import labelDetails from '@salesforce/label/c.Details';
// import labelReviews for Reviews
import labelReviews from '@salesforce/label/c.Reviews';
// import labelAddReview for Add_Review
import labelAddReview from '@salesforce/label/c.Add_Review';
// import labelFullDetails for Full_Details
import labelFullDetails from '@salesforce/label/c.Full_Details';
// import labelPleaseSelectABoat for Please_select_a_boat
import labelPleaseSelectABoat from '@salesforce/label/c.Please_select_a_boat';
// Boat__c Schema Imports
import BOAT from '@salesforce/schema/Boat__c';
// import BOAT_ID_FIELD for the Boat Id
import BOAT_ID_FIELD from '@salesforce/schema/Boat__c.Id';
// import BOAT_NAME_FIELD for the boat Name
import BOAT_NAME_FIELD from '@salesforce/schema/Boat__c.Name';
import {LightningElement, wire} from 'lwc';
import { getRecord,getFieldValue } from 'lightning/uiRecordApi';
import { APPLICATION_SCOPE,subscribe, MessageContext,unsubscribe } from 'lightning/messageService';
import BOATMC from "@salesforce/messageChannel/BoatMessageChannel__c";
import { NavigationMixin } from 'lightning/navigation';

const BOAT_FIELDS = [BOAT_ID_FIELD, BOAT_NAME_FIELD];
export default class BoatDetailTabs extends  NavigationMixin(LightningElement) {
  boatId;
  wiredRecord;
  label = {
    labelDetails,
    labelReviews,
    labelAddReview,
    labelFullDetails,
    labelPleaseSelectABoat,
  };
  
  @wire(getRecord,{recordId:'$boatId' , fields:BOAT_FIELDS})
  wiredRecord
  // Decide when to show or hide the icon
  // returns 'utility:anchor' or null
  get detailsTabIconName() { 
      if(this.wiredRecord.data){
        return 'utility:anchor';
      }
      return null;
  }
  
  // Utilize getFieldValue to extract the boat name from the record wire
  get boatName() {
    return getFieldValue(this.wiredRecord.data, BOAT_NAME_FIELD);
   }
  
  // Private
  subscription = null;
  
  @wire(MessageContext)
  messageContext;

  // Subscribe to the message channel
  subscribeMC() {
    // local boatId must receive the recordId from the message
    if (this.subscription) {
        return;
      }
      // Subscribe to the message channel to retrieve the recordId and explicitly assign it to boatId.
      this.subscription = subscribe(
        this.messageContext,
        BOATMC,
        (message) => {this.boatId = message.recordId},
        { scope: APPLICATION_SCOPE }
      );
  }
  
  // Calls subscribeMC()
  connectedCallback() { 
      this.subscribeMC();
  }
  
  // Navigates to record page
  navigateToRecordViewPage() { 
    this[NavigationMixin.Navigate]({
        type: 'standard__recordPage',
        attributes: {
            recordId: this.boatId,
            objectApiName: 'Boat__c',
            actionName: 'view'
        }
    });
  }
  
  // Navigates back to the review list, and refreshes reviews component
  handleReviewCreated() { 
   
      this.template.querySelector('lightning-tabset').activeTabValue = "reviews"; 

      this.template.querySelector('c-boat-reviews').refresh();

  }
}
