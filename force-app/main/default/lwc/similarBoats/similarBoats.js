// imports
// import getSimilarBoats
import { NavigationMixin } from 'lightning/navigation';
import getSimilarBoats from '@salesforce/apex/BoatDataService.getSimilarBoats';
import {api, LightningElement, track, wire} from 'lwc'; 
export default class SimilarBoats extends NavigationMixin(LightningElement) {
    // Private
    @track
    currentBoat;
    @track
    relatedBoats;
    @track
    boatId;
    @track
    error;
    
    // public
    @api
    get recordId() {
        // returns the boatId
        return this.boatId;
      }
      set recordId(value) {
          // sets the boatId value
          // sets the boatId attribute
          this.boatId = value;
          this.setAttribute('boatId',value);
      }
    
    // public
    @api
    similarBy;
    
    // Wire custom Apex call, using the import named getSimilarBoats
    // Populates the relatedBoats list
    @wire(getSimilarBoats,{boatId:'$boatId',similarBy:'$similarBy'})
    similarBoats({ error, data }) {
        this.relatedBoats = data;
     }
    get getTitle() {
      return 'Similar boats by ' + this.similarBy;
    }
    get noBoats() {
      return !(this.relatedBoats && this.relatedBoats.length > 0);
    }
    
    // Navigate to record page
    openBoatDetailPage(event) {
        let bid = event.detail.boatId;
        this[NavigationMixin.Navigate]({
            type: 'standard__recordPage',
            attributes: {
                recordId: bid,
                objectApiName: 'Boat__c',
                actionName: 'view'
            },
            
        });
     }
  }
  