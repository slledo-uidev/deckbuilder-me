import { Component, EventEmitter, Input, Output, OnInit, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-search-bar',
  templateUrl: './search-bar.component.html',
  styleUrls: ['./search-bar.component.scss']
})
export class SearchBarComponent implements OnInit, OnDestroy {
  @Input() placeholder = 'Search cards...';
  @Input() debounceTime = 300;
  @Output() searchChange = new EventEmitter<string>();
  @Output() searchClear = new EventEmitter<void>();
  
  searchText = '';
  private searchSubject = new Subject<string>();
  private destroy$ = new Subject<void>();
  
  ngOnInit(): void {
    this.searchSubject
      .pipe(
        debounceTime(this.debounceTime),
        distinctUntilChanged(),
        takeUntil(this.destroy$)
      )
      .subscribe(value => {
        this.searchChange.emit(value);
      });
  }
  
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
  
  onSearchInput(value: string): void {
    this.searchText = value;
    this.searchSubject.next(value);
  }
  
  onClearSearch(): void {
    this.searchText = '';
    this.searchSubject.next('');
    this.searchClear.emit();
  }
}
