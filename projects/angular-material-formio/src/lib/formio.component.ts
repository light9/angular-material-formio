import { Component, Optional, ChangeDetectorRef, ViewContainerRef, ViewChild, ComponentFactoryResolver, NgZone } from '@angular/core';
import { FormioBaseComponent } from './angular-formio/FormioBaseComponent';
import { FormioLoader } from './angular-formio/components/loader/formio.loader';
import { FormioAppConfig } from './angular-formio/formio.config';
import { Form } from './renderer';
import { get } from 'lodash';
@Component({
  selector: 'mat-formio',
  styles: [
    `.alert-danger {
      color: #721c24;
      background-color: #f8d7da;
      border-color: #f5c6cb;
    }
    .alert-success {
      color: #155724;
      background-color: #d4edda;
      border-color: #c3e6cb;
    }
    .alert {
      position: relative;
      padding: .75rem 1.25rem;
      margin-bottom: 0.5rem;
      border: 1px solid transparent;
      border-radius: .25rem;
    }`
  ],
  template: `
    <mat-spinner *ngIf="loader.loading"></mat-spinner>
    <div *ngIf="!this.options?.disableAlerts">
      <div *ngFor="let alert of alerts.alerts" class="alert alert-{{ alert.type }}" role="alert">{{ alert.message }}</div>
    </div>
    <div fxLayout="column" fxLayoutGap="1em">
      <ng-template #formio></ng-template>
    </div>
  `
})
export class FormioComponent extends FormioBaseComponent {
  @ViewChild('formio', {static: true, read: ViewContainerRef}) formioViewContainer: ViewContainerRef;
  constructor(
    private resolver: ComponentFactoryResolver,
    private cd: ChangeDetectorRef,
    public ngZone: NgZone,
    public loader: FormioLoader,
    @Optional() public config: FormioAppConfig
  ) {
    super(ngZone, loader, config);
  }

  getRendererOptions(): any {
    return {...super.getRendererOptions(), validateOnInit: get(this.options, 'validateOnInit', true) }
  }

  createRenderer() {
    const options = this.getRendererOptions();
    options.viewResolver = this.resolver;
    const form = new Form();
    form._form = this.form;
    form.options = options;
    form.options.events = form.events;
    form.instance = form.create(this.form.display);
    form.instance.viewContainer = () => this.formioViewContainer;
    this.ngZone.run(() => form.instance.setForm(this.form)
      .then(() => form.readyResolve(form.instance))
      .catch(() => form.readyReject())
    );
    return form.instance;
  }
}
