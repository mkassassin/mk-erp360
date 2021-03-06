import { Component, OnInit } from '@angular/core';
import { HrmsService } from './../../../../services/Hrms/hrms.service';
import { PermissionsCheckService } from './../../../../services/PermissionsCheck/permissions-check.service';
import { LoginService } from './../../../../services/LoginService/login.service';
import { Router, ActivatedRoute} from '@angular/router';
import * as CryptoJS from 'crypto-js';
import { ToastrService } from '../../../../services/common-services/toastr-service/toastr.service';
import { BsModalService } from 'ngx-bootstrap/modal';
import { BsModalRef } from 'ngx-bootstrap';
import { ModelLeaveConfirmComponent } from 'src/app/models/HRMS/model-leave-confirm/model-leave-confirm.component';
@Component({
  selector: 'app-view-leaves',
  templateUrl: './view-leaves.component.html',
  styleUrls: ['./view-leaves.component.css']
})
export class ViewLeavesComponent implements OnInit {
   Loader: Boolean = true;
   Company_Id;
   User_Id;
   User_Info: any;
   User_Type: any;
   Leaves_Id: any;
   _Data: any;
   showEditButton: Boolean = true;
   showRequestButton: Boolean = true;
   showApproveButton: Boolean = true;
   showModifyButton: Boolean = true;
   showRejectButton: Boolean = true;
   bsModalRef: BsModalRef;

   constructor(
      public PermissionCheck: PermissionsCheckService,
      private modalService: BsModalService,
      public router: Router,
      public active_route: ActivatedRoute,
      private Login_Service: LoginService,
      private Hrms_Service: HrmsService,
      private Toastr: ToastrService,
   ) {
      // get user login info
      this.User_Info = this.Login_Service.LoggedUserInfo();
      console.log(this.User_Info);
      this.Company_Id = this.User_Info.Company_Id;
      this.User_Id = this.User_Info._id;
      this.User_Type = this.User_Info.User_Type['User_Type'];
      this.active_route.url.subscribe(u => {
         this.Leaves_Id = this.active_route.snapshot.params['Leaves_Id'];
         const Data = {'Company_Id': this.Company_Id, 'User_Id': this.User_Id, 'Leaves_Id': this.Leaves_Id};
         let Info = CryptoJS.AES.encrypt(JSON.stringify(Data), 'SecretKeyIn@123');
         Info = Info.toString();
         // get Leaves details
         this.Hrms_Service.HrmsLeaves_View({'Info': Info}).subscribe( response => {
         const ResponseData = JSON.parse(response['_body']);
         if (response['status'] === 200 && ResponseData['Status'] ) {
            const CryptoBytes  = CryptoJS.AES.decrypt(ResponseData['Response'], 'SecretKeyOut@123');
            const DecryptedData = JSON.parse(CryptoBytes.toString(CryptoJS.enc.Utf8));
            this._Data = DecryptedData;
            this.showButtons(this._Data.Status);
            this.Loader = (!this._Data) ? true : false;
         } else if (response['status'] === 400 || response['status'] === 417  && !ResponseData['Status']) {
         this.Toastr.NewToastrMessage({ Type: 'Error', Message: response['Message'] });
         } else if (response['status'] === 401 && !ResponseData['Status']) {
         this.Toastr.NewToastrMessage({ Type: 'Error',  Message: ResponseData['Message'] });
         } else {
         this.Toastr.NewToastrMessage( { Type: 'Error', Message: 'Some Error Occurred!, But not Identify!' });
         }
         });
      });
   }

   ngOnInit() {}
   showButtons(status) {
      this.showEditButton = ((status === 'Draft' || status === 'Modify')) ? true : false;
      this.showRequestButton = ((status === 'Draft')) ? true : false;
      this.showModifyButton = ((status === 'Requested') && (this.User_Id !== this._Data.Requested_By.UserManagement_Id)) ?  true : false;
      this.showRejectButton = ((status === 'Requested') && (this.User_Id !== this._Data.Requested_By.UserManagement_Id)) ? true : false;
      this.showApproveButton = ((status === 'Requested') && (this.User_Id !== this._Data.Requested_By.UserManagement_Id)) ? true : false;
   }
   Edit() {
      this.router.navigate(['Edit_Leaves', this.Leaves_Id]);
   }
   Request() {
      const initialState = {
         Type: 'Confirm_Request',
         Data: this.Leaves_Id,
      };
      this.bsModalRef = this.modalService.show(ModelLeaveConfirmComponent, Object.assign({initialState}, { class: '' , ignoreBackdropClick: true}));
   }
   Modify() {
      const initialState = {
         Type: 'Confirm_Modify',
         Data: this.Leaves_Id,
      };
      this.bsModalRef = this.modalService.show(ModelLeaveConfirmComponent, Object.assign({initialState}, { class: '' , ignoreBackdropClick: true}));
   }
   Approve() {
      const initialState = {
         Type: 'Confirm_Approve',
         Data: this.Leaves_Id,
      };
      this.bsModalRef = this.modalService.show(ModelLeaveConfirmComponent, Object.assign({initialState}, { class: '' , ignoreBackdropClick: true}));
   }
   Reject() {
      const initialState = {
         Type: 'Confirm_Reject',
         Data: this.Leaves_Id,
      };
      this.bsModalRef = this.modalService.show(ModelLeaveConfirmComponent, Object.assign({initialState}, { class: '' , ignoreBackdropClick: true}));
   }

}
