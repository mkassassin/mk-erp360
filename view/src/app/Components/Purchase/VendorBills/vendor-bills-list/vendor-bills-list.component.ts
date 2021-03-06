import { Component, OnInit } from '@angular/core';

import { BsModalService } from 'ngx-bootstrap/modal';
import { BsModalRef } from 'ngx-bootstrap';

import { DeleteConfirmationComponent } from '../../../../Components/Common-Components/delete-confirmation/delete-confirmation.component';


@Component({
  selector: 'app-vendor-bills-list',
  templateUrl: './vendor-bills-list.component.html',
  styleUrls: ['./vendor-bills-list.component.css']
})
export class VendorBillsListComponent implements OnInit {

   bsModalRef: BsModalRef;
   constructor( private modalService: BsModalService) { }


   ngOnInit() {
   }
   DeleteVendorBills() {
      const initialState = {
      Text: 'Vendor Bills'
      };
      this.bsModalRef = this.modalService.show(DeleteConfirmationComponent, Object.assign({initialState}, { class: 'modal-sm' }));
   }
}
