// imports
// import BOAT_REVIEW_OBJECT from schema - BoatReview__c
// import NAME_FIELD from schema - BoatReview__c.Name
import NAME_FIELD from '@salesforce/schema/BoatReview__c.Name';
import BOAT_REVIEW_OBJECT from '@salesforce/schema/BoatReview__c';
import { updateRecord } from 'lightning/uiRecordApi';
import { refreshApex } from '@salesforce/apex';
import {ShowToastEvent} from 'lightning/platformShowToastEvent';
import { api, track ,LightningElement} from "lwc";

// import COMMENT_FIELD from schema - BoatReview__c.Comment__c
import COMMENT_FIELD from '@salesforce/schema/BoatReview__c.Comment__c';

const SUCCESS_TITLE = 'Review Created!';
const SUCCESS_VARIANT = 'success';
const CREATE_REVIEW = 'createreview';

export default class BoatAddReviewForm extends LightningElement {
    // Private
    @track
    boatId;
    @track
    rating;
    boatReviewObject = BOAT_REVIEW_OBJECT;
    nameField        = NAME_FIELD;
    commentField     = COMMENT_FIELD;
    labelSubject = 'Review Subject';
    labelRating  = 'Rating';
    
    // Public Getter and Setter to allow for logic to run on recordId change
    @api
    get recordId() {
      return this.boatId;
     }
    set recordId(value) {
      //sets boatId attribute
      //sets boatId assignment
      this.setAttribute('boatId',value);
      this.boatId = value;
     
    }
    
    // Gets user rating input from stars component
    handleRatingChanged(event) {
        this.rating = event.detail.rating;
     }
    
    // Custom submission handler to properly set Rating
    // This function must prevent the anchor element from navigating to a URL.
    // form to be submitted: lightning-record-edit-form
    handleSubmit(event) {
      event.preventDefault();       // stop the form from submitting
      const fields = event.detail.fields;
      fields.Boat__c = this.boatId;
      fields.Rating__c = this.rating;
      this.template.querySelector('lightning-record-edit-form').submit(fields);
     }
    
    // Shows a toast message once form is submitted successfully
    // Dispatches event when a review is created
    handleSuccess(event) {
      const createreviewEventnew = new CustomEvent(CREATE_REVIEW);
      this.dispatchEvent(createreviewEventnew);
      this.handleReset();
      const evts = new ShowToastEvent({
        title: SUCCESS_TITLE,
        variant: SUCCESS_VARIANT
        });
        this.dispatchEvent(evts);
      // TODO: dispatch the custom event and show the success message
     
    }
    
    // Clears form data upon submission
    // TODO: it must reset each lightning-input-field
    handleReset() { 
      const inputFields = this.template.querySelectorAll(
        'lightning-input-field'
    );
    if (inputFields) {
        inputFields.forEach(field => {
            field.reset();
        });
    }
    }
  }
  