import { Component, OnInit } from '@angular/core';
import { StorageService, ValidationService } from '@core/services';
import { Deck } from '@core/models';

@Component({
  selector: 'app-deck-builder',
  templateUrl: './deck-builder.component.html',
  styleUrls: ['./deck-builder.component.scss']
})
export class DeckBuilderComponent implements OnInit {
  
  constructor(
    private storageService: StorageService,
    private validationService: ValidationService
  ) { }
  
  ngOnInit(): void {
    console.log('DeckBuilderComponent initialized - Atomic components ready!');
  }
  
  handleButtonClick(buttonType: string): void {
    console.log(`${buttonType} button clicked!`);
  }
  
}
