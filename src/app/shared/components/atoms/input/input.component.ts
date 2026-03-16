import { Component, Input, Output, EventEmitter, forwardRef } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'app-input',
  templateUrl: './input.component.html',
  styleUrls: ['./input.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => InputComponent),
      multi: true
    }
  ]
})
export class InputComponent implements ControlValueAccessor {
  @Input() type: 'text' | 'number' | 'email' | 'password' | 'search' = 'text';
  @Input() placeholder: string = '';
  @Input() label: string = '';
  @Input() disabled: boolean = false;
  @Input() error: string = '';
  @Input() fullWidth: boolean = false;
  @Input() value: string | number = '';
  
  @Output() valueChange = new EventEmitter<string>();
  isFocused: boolean = false;
  
  // ControlValueAccessor implementation
  private onChange: (value: string) => void = () => {};
  private onTouched: () => void = () => {};
  
  writeValue(value: string): void {
    this.value = value || '';
  }
  
  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }
  
  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }
  
  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }
  
  onInputChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.value = target.value;
    this.onChange(this.value);
    this.valueChange.emit(this.value);
  }
  
  onFocus(): void {
    this.isFocused = true;
  }
  
  onBlur(): void {
    this.isFocused = false;
    this.onTouched();
  }
  
  get inputClasses(): string {
    const classes = ['input'];
    
    if (this.error) {
      classes.push('input--error');
    }
    
    if (this.isFocused) {
      classes.push('input--focused');
    }
    
    return classes.join(' ');
  }
  
  get wrapperClasses(): string {
    const classes = ['input-wrapper'];
    
    if (this.fullWidth) {
      classes.push('input-wrapper--full-width');
    }
    
    return classes.join(' ');
  }
}
