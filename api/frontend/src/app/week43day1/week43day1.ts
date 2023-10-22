import {Component} from '@angular/core';
import {FormControl} from "@angular/forms";
import {HttpClient} from "@angular/common/http";
import {firstValueFrom} from "rxjs";
import {CURRENCYCONVERTERAPIKEY, GEOCODEAPIKEY} from "./apikeys";
import {
  Address,
  AddressAPIJsonResponseModel,
  CountriesAPIJsonResponseModel,
  CurrencyConverterAPIJsonResponseModel
} from "../models";

@Component({
  selector: 'app-43Day1',
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
    </ion-item>

  `,
})
export class Week43Day1Component {

  constructor(public http: HttpClient) {
  }

  convertedCurrencyCode: string = "";
  convertedCurrencyValue: number = 0;
  addressSuggestions: Address[] = [];
  addressField = new FormControl('');
  salesPrice: number = 42;

  async updateSuggestions(): Promise<void> {
    if (this.addressField.value?.length! < 3) return;
    const address = "https://api.geoapify.com/v1/geocode/autocomplete";
    const params: any = {
      text: this.addressField.value,
      format: "json",
      apiKey: GEOCODEAPIKEY
    };
    const observable = this.http.get<AddressAPIJsonResponseModel>(address, {params: params});
    const addressResult = await firstValueFrom<AddressAPIJsonResponseModel>(observable);
    this.addressSuggestions = addressResult.results;
    if (addressResult.results.length == 1) {
      this.currencyConvert(addressResult.results[0])
    }
  }

  async getCurrenciesForAddress(address: Address): Promise<string> {
    const countryObservable = this.http.get<CountriesAPIJsonResponseModel[]>('https://restcountries.com/v3.1/alpha/' + address.country_code);
    const countries = await firstValueFrom<CountriesAPIJsonResponseModel[]>(countryObservable);
    return Object.keys(countries[0].currencies)[0];
  }

  async currencyConvert(address: Address): Promise<void> {
    const url = "https://api.freecurrencyapi.com/v1/latest"
    const params: any = {
      base_currency: "DKK",
      currencies: await this.getCurrenciesForAddress(address),
      apikey: CURRENCYCONVERTERAPIKEY
    }
    const observable = this.http.get<CurrencyConverterAPIJsonResponseModel>(url, {params: params});
    const currencyConversionResult = await firstValueFrom<CurrencyConverterAPIJsonResponseModel>(observable);
    this.convertedCurrencyCode = Object.keys(currencyConversionResult.data)[0];
    this.convertedCurrencyValue = Number.parseFloat(Object.values(currencyConversionResult.data)[0] + "") * this.salesPrice;
  }
}
