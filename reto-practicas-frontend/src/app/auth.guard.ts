// src/app/auth.guard.ts
import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(private router: Router) {}

  canActivate(): boolean {
    const usuarioId = localStorage.getItem('usuarioId');
    if (usuarioId) {
      return true;
    } else {
      this.router.navigate(['/login']); 
      return false;
    }
  }
}
