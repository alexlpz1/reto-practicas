import { bootstrapApplication } from '@angular/platform-browser';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';

import { AppComponent } from './app/app.component';
import { routes } from './app/app.routes';

bootstrapApplication(AppComponent, {
  providers: [
    provideHttpClient(),     // 💡 Para HttpClient en tus servicios/componentes
    provideRouter(routes)    // 💡 Para configurar las rutas en Angular
  ]
}).catch((err) => console.error(err));
