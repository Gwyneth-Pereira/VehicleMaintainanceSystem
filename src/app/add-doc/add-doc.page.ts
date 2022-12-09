import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { LoadingController } from '@ionic/angular';
import { Observable } from 'rxjs';
import { DataSrvService } from '../data-srv.service';
import { Car, FirebaseService } from '../firebase.service';

@Component({
  selector: 'app-add-doc',
  templateUrl: './add-doc.page.html',
  styleUrls: ['./add-doc.page.scss'],
})
export class AddDocPage implements OnInit {
  CarID;
  Document={Title:'',Img:''}
  public Car: Observable<Car[]>;
  image;
 private updatedCar:Car={}as Car;
  constructor(private DataSrv:DataSrvService,private loading:LoadingController,private router:Router, private Firebase:FirebaseService) { }

  ngOnInit() {
    this.Car=this.Firebase.getCars();
  }

  async AddImage()
    {
     this.image =await this.DataSrv.getImage();
     this.Document.Img='Image Selected';
     
    }
   async  Submit()
    {
      const load=await this.loading.create();
     await load.present();
      if(this.image)
      {
        const path='Documents/Cars/'+this.CarID+'.'+this.image.format;
        const url=this.Firebase.uploadImage(this.image,path);

        this.Car.subscribe((result)=>
          {for(let i =0;i<result.length;i++)
            if(result[i].numPlate==this.CarID)
              this.updatedCar=result[i];});

          url.then(re=>{
            this.Document.Img=re;
            this.updatedCar.document.push(this.Document);
            console.log("CAR URL: "+this.Document.Img);
            console.log(this.updatedCar.document);
            
            this.Firebase.updateCar(this.updatedCar).then(succ=>{
              this.DataSrv.presentToast('File Uploaded Successfully');
              this.router.navigate(['carinfo']);
          },error=>{this.DataSrv.showError("Error",error);});
         



            })
            
          
         
    

             
        await load.dismiss();
        
      }


    }


}
