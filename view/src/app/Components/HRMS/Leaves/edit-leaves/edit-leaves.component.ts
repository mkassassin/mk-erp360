import { Component, OnInit } from '@angular/core';
import {NativeDateAdapter} from '@angular/material';
import {DateAdapter} from '@angular/material/core';
import { HrService } from './../../../../services/Hr/hr.service';
import { HrmsService } from './../../../../services/Hrms/hrms.service';
import { HrmsSettingsService } from './../../../../services/settings/HrmsSettings/hrms-settings.service';
import { ToastrService } from '../../../../services/common-services/toastr-service/toastr.service';
import { PermissionsCheckService } from './../../../../services/PermissionsCheck/permissions-check.service';
import { LoginService } from './../../../../services/LoginService/login.service';
import { Router, ActivatedRoute } from '@angular/router';
import { CompanySettingsService } from '../../../../services/settings/CompanySettings/company-settings.service';
import { FormGroup, Validators, FormControl, AbstractControl, FormBuilder, FormArray } from '@angular/forms';
import * as CryptoJS from 'crypto-js';
import { map } from 'rxjs/operators';
import { HrSettingsService } from 'src/app/services/settings/HrSettings/hr-settings.service';

@Component({
  selector: 'app-edit-leaves',
  templateUrl: './edit-leaves.component.html',
  styleUrls: ['./edit-leaves.component.css']
})
export class EditLeavesComponent implements OnInit {
   _LeaveType: any;
   _Name: any;
   Loader: Boolean = true;
   Company_Id;
   User_Id;
   User_Info: any;
   User_Type: any;
   _Department: any;
   _Designation: any;
   Department;
   Contact_Number;
   Designation;
   Form: FormGroup;
   Current_Id: any;
   Leaves_Id: any;
   _Data: any;
   constructor(
      private Toastr: ToastrService,
      public PermissionCheck: PermissionsCheckService,
      public router: Router,
      private active_route: ActivatedRoute,
      private Login_Service: LoginService,
      private Hr_Service: HrService,
      private Hrms_Service: HrmsService,
      public HrSettingService: HrSettingsService,
      private Hrms_Setting_Service: HrmsSettingsService,
      private CompanySettingService: CompanySettingsService,
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
         // get leave types
         this.Hrms_Setting_Service.Leave_Type_List({'Info': Info}).subscribe(response => {
            const ResponseData = JSON.parse(response['_body']);
            if (response['status'] === 200 && ResponseData['Status'] ) {
               const CryptoBytes  = CryptoJS.AES.decrypt(ResponseData['Response'], 'SecretKeyOut@123');
               const DecryptedData = JSON.parse(CryptoBytes.toString(CryptoJS.enc.Utf8));
               this._LeaveType = DecryptedData;
            } else if (response['status'] === 400 || response['status'] === 417  && !ResponseData['Status']) {
               this.Toastr.NewToastrMessage({ Type: 'Error', Message: response['Message'] });
            } else if (response['status'] === 401 && !ResponseData['Status']) {
               this.Toastr.NewToastrMessage({ Type: 'Error',  Message: ResponseData['Message'] });
            } else {
               this.Toastr.NewToastrMessage( { Type: 'Error', Message: 'Some Error Occurred!, But not Identify!' });
            }
            });
         // get Leaves details
         this.Hrms_Service.HrmsLeaves_View({'Info': Info}).subscribe( response => {
         const ResponseData = JSON.parse(response['_body']);
         if (response['status'] === 200 && ResponseData['Status'] ) {
            const CryptoBytes  = CryptoJS.AES.decrypt(ResponseData['Response'], 'SecretKeyOut@123');
            const DecryptedData = JSON.parse(CryptoBytes.toString(CryptoJS.enc.Utf8));
            this._Data = DecryptedData;
            if (this._Data) {
               this.simpleEdit();
               this.Loader = false;
            }
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

   ngOnInit() {
      this.Form = new FormGroup({
         Leaves_Id: new FormControl(null, Validators.required),
         Requested_By: new FormControl(null),
         Department: new FormControl(null),
         Designation: new FormControl(null),
         Contact_Number: new FormControl(null),
         Leave_Type: new FormControl(null, Validators.required),
         Form_Date: new FormControl(null, Validators.required),
         To_Date: new FormControl(null, Validators.required),
         Purpose: new FormControl(null, Validators.required),
         Company_Id: new FormControl(this.Company_Id, Validators.required),
         User_Id: new FormControl(this.User_Id, Validators.required),
      });
   }
   simpleEdit() {
      this.Form.controls['Leaves_Id'].setValue(this.Leaves_Id);
      this.Form.controls['Requested_By'].setValue(this._Data.Requested_By.Employee_Name);
      this.Form.controls['Department'].setValue(this._Data.Requested_By.General_Info_Department.Department_Name);
      this.Form.controls['Designation'].setValue(this._Data.Requested_By.General_Info_Designation.Designation);
      this.Form.controls['Contact_Number'].setValue(this._Data.Requested_By.General_Info_Mobile_Number);
      this.Form.controls['Requested_By'].disable();
      this.Form.controls['Department'].disable();
      this.Form.controls['Designation'].disable();
      this.Form.controls['Contact_Number'].disable();

      this.Form.controls['Leave_Type'].setValue(this._Data.Leave_Type._id);
      this.Form.controls['Form_Date'].setValue(this._Data.Form_Date);
      this.Form.controls['To_Date'].setValue(this._Data.To_Date);
      this.Form.controls['Purpose'].setValue(this._Data.Purpose);
   }
   Submit() {
      console.log(this.Form.value);
      if (this.Form.valid) {
         this.Loader = true;
         let Info = CryptoJS.AES.encrypt(JSON.stringify(this.Form.getRawValue()), 'SecretKeyIn@123');
         Info = Info.toString();
         this.Hrms_Service.HrmsLeaves_Edit({ 'Info': Info }).subscribe( response => {
            const ResponseData = JSON.parse(response['_body']);
            if (response['status'] === 200 && ResponseData['Status'] ) {
               this.router.navigate(['/List_Leaves']);
               this.Toastr.NewToastrMessage({ Type: 'Success', Message: ResponseData['Message'] });
            } else if (response['status'] === 400 || response['status'] === 417 && !ResponseData['Status']) {
               this.Toastr.NewToastrMessage({ Type: 'Error', Message: ResponseData['Message'] });
            } else if (response['status'] === 401 && !ResponseData['Status']) {
               this.Toastr.NewToastrMessage({ Type: 'Error', Message: ResponseData['Message'] });
            } else {
               this.Toastr.NewToastrMessage({ Type: 'Error', Message: 'Creating Lead Getting Error!, But not Identify!' });
            }
            this.Loader = false;
         });
      }
   }

}
