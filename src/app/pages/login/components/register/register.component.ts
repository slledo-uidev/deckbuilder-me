import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '@services/auth.service';
import { ToastService } from '@services/toast.service';

function passwordsMatchValidator(control: AbstractControl): ValidationErrors | null {
  const password = control.get('password')?.value;
  const confirm  = control.get('confirmPassword')?.value;
  return password && confirm && password !== confirm ? { passwordsMismatch: true } : null;
}

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent implements OnInit {
  registerForm!: FormGroup;
  isSubmitting = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private toast: ToastService
  ) {}

  ngOnInit(): void {
    if (this.authService.isAuthenticated()) {
      this.router.navigate(['/gallery']);
      return;
    }

    this.registerForm = this.fb.group({
      displayName:     ['', [Validators.required, Validators.minLength(3), Validators.maxLength(30)]],
      email:           ['', [Validators.required, Validators.email]],
      password:        ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', [Validators.required]]
    }, { validators: passwordsMatchValidator });
  }

  async onRegister(): Promise<void> {
    if (this.registerForm.invalid) { return; }

    this.isSubmitting = true;

    const { email, password, displayName } = this.registerForm.value;
    const error = await this.authService.register(email, password, displayName);

    if (!error) {
      // Supabase auto-loguea al usuario cuando "Confirm email" está desactivado.
      // Hacemos logout para que el usuario pase por el flujo de login normalmente.
      await this.authService.logout();
      this.toast.success('¡Cuenta creada! Redirigiendo al inicio de sesión...');
      this.isSubmitting = false;
      this.registerForm.reset();
      setTimeout(() => this.router.navigate(['/login']), 3000);
    } else {
      console.error('[Register] Supabase error:', error);
      this.toast.error(this.mapError(error));
      this.isSubmitting = false;
    }
  }

  private mapError(msg: string): string {
    const m = msg.toLowerCase();
    if (m.includes('already registered') || m.includes('already exists') || m.includes('user already registered')) {
      return 'Ya existe una cuenta con ese email.';
    }
    if (m.includes('is invalid') && m.includes('email')) {
      return 'El email introducido no es válido. Usa una dirección real (ej: usuario@gmail.com).';
    }
    if (m.includes('password')) {
      return 'La contraseña no cumple los requisitos mínimos de Supabase.';
    }
    if (m.includes('email') && (m.includes('invalid') || m.includes('format'))) {
      return 'El formato del email no es válido.';
    }
    if (m.includes('signup') && m.includes('disabled')) {
      return 'El registro está deshabilitado temporalmente.';
    }
    if (m.includes('rate limit') || m.includes('too many')) {
      return 'Demasiados intentos. Espera un momento e inténtalo de nuevo.';
    }
    return `Error: ${msg}`;
  }

  goToLogin(): void { this.router.navigate(['/login']); }

  get regDisplayName()    { return this.registerForm.get('displayName'); }
  get regEmail()          { return this.registerForm.get('email'); }
  get regPassword()       { return this.registerForm.get('password'); }
  get regConfirmPassword(){ return this.registerForm.get('confirmPassword'); }
  get passwordsMismatch() { return this.registerForm.hasError('passwordsMismatch') && this.regConfirmPassword?.touched; }
}
