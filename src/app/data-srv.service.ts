import { Injectable } from '@angular/core';

export interface paired {
  "class": number,
  "id": string,
  "address": string,
  "name": string,
  
}
@Injectable({
  providedIn: 'root'
})
export class DataSrvService {
}
