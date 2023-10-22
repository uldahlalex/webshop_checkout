import {Component} from '@angular/core';
import {FormControl} from "@angular/forms";
import {HttpClient, HttpErrorResponse} from "@angular/common/http";
import {firstValueFrom} from "rxjs";
import {Address, AddressAPIJsonResponseModel, CurrencyConverterAPIJsonResponseModel} from "../models";
import {ToastController} from "@ionic/angular";

@Component({
  selector: 'app-43Day2',
  template: `
    <ion-toolbar>
      <ion-title>Checkout</ion-title>
    </ion-toolbar>

    <ion-item>
      Address: <input list="datalist" [formControl]="addressField" (input)="updateSuggestions()">
      <datalist id="datalist">
        <option *ngFor="let i of addressSuggestions" [value]="i.formatted" (click)="currencyConvert(i)"></option>
      </datalist>
    </ion-item>

    <ion-item>
      Arbitrary sales price in DKK: {{salesPrice}}
    </ion-item>

    <ion-item *ngIf="convertedCurrencyCode">
      That amounds to a total of {{convertedCurrencyValue}} {{convertedCurrencyCode}}

      <ion-button (click)="placeOrder()">Yes I want to order!</ion-button>
    </ion-item>


  `,
})
export class Week43Day2Component {

  constructor(public http: HttpClient, public toastController: ToastController) {
  }

  convertedCurrencyCode: string = "";
  convertedCurrencyValue: number = 0;
  addressSuggestions: Address[] = [];
  addressField = new FormControl('');
  salesPrice: number = 42;

  async updateSuggestions(): Promise<void> {
    if (this.addressField.value?.length! < 3) return;
    const address = "http://localhost:5000/api/address";
    const params: any = {
      addressSearchTerm: this.addressField.value,
    };
    const observable = this.http.get<AddressAPIJsonResponseModel>(address, {params: params});
    const addressResult = await firstValueFrom<AddressAPIJsonResponseModel>(observable);
    this.addressSuggestions = addressResult.results;
    if (addressResult.results.length == 1) {
      this.currencyConvert(addressResult.results[0])
    }
  }

  async currencyConvert(address: Address): Promise<void> {
    const url = "http://localhost:5000/api/currency"
    const params: any = {
      fullAddress: address.formatted
    }
    const observable = this.http.get<CurrencyConverterAPIJsonResponseModel>(url, {params: params});
    const currencyConversionResult = await firstValueFrom<CurrencyConverterAPIJsonResponseModel>(observable);
    this.convertedCurrencyCode = Object.keys(currencyConversionResult.data)[0];
    this.convertedCurrencyValue = Number.parseFloat(Object.values(currencyConversionResult.data)[0] + "") * this.salesPrice;
  }

  /**
   * This is just for week 44: Email integration for order confirmation
   */
  async placeOrder() {
    try {
      const observable = this.http.post<any>('http://localhost:5000/api/order', {
        dkkPrice: this.salesPrice,
        convertedPrice: this.convertedCurrencyValue,
        shippingAddress: this.addressField.value,
      });
      const result = await firstValueFrom<any>(observable);
      const toast = await this.toastController.create({
        message: result.message,
        color: "success",
        duration: 5000
      })
      toast.present();
    } catch (e) {
      console.log(e)
      if (e instanceof HttpErrorResponse) {
        const toast = await this.toastController.create({
          message: e.message,
          color: "success",
          duration: 5000
        })
        toast.present();
      }

    }

  }

}
