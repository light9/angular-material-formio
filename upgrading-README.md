# Info

https://github.com/formio/angular-material-formio/issues/59
https://github.com/mprinc/angular-material-formio/releases/tag/1.3.5
https://github.com/missmeinders/Search-Data/issues/26

https://angular.io/guide/creating-libraries

# Building (failed eventually)

+ on github fork https://github.com/albert5287/angular-material-formio

In local:

```sh
git clone https://github.com/mprinc/angular-material-formio
git checkout angular_v9_update
# increase version (for example 1.3.5)
joe package.json
joe projects/angular-material-formio/package.json
yarn
# this should be fine, but we issued problems, see later
ng build angular-material-formio
```

# Testing

To make it in our app we do:

Quicker:
```sh
cd /Users/mprinc/data/development/ML/Search-Data/frontend/ml-share/
rm -rf node_modules/angular-material-formio
cp -r /Users/mprinc/data/development/libs/angular-material-formio/angular-material-formio/dist node_modules/angular-material-formio
cat node_modules/angular-material-formio/package.json | grep version
#  "version": "1.3.3",
```

Safer:
```sh
cd /Users/mprinc/data/development/ML/Search-Data/frontend/ml-share/node_modules
mv angular-material-formio angular-material-formio-ng8
cp -r /Users/mprinc/data/development/libs/angular-material-formio/angular-material-formio/dist angular-material-formio-ng9
cp -r angular-material-formio-ng9 angular-material-formio
```

## Problem with angular-formio

The problem was that after building the library I started getting error: `Can't bind to 'form' since it isn't a known property of 'mat-formio'.`

This was due to `angular-material-formio` depending on `angular-formio`

so the `angular-material-formio/src/lib/formio.component.ts` has:

```ts
@Component({
  selector: 'mat-formio',
// ...
export class FormioComponent extends FormioBaseComponent {
// ...
```

Where the `FormioBaseComponent` is from `angular-formio/src/FormioBaseComponent.ts` (so addressed thrugh node mapping in `node_modules`) and it has

```ts
export class FormioBaseComponent implements OnInit, OnChanges, OnDestroy {
  @Input() form?: FormioForm;
// ...
  @Output() submit = new EventEmitter<object>();
// ..
```

It seems that these Input and Outputs are NOT properly either exported to the `angular-material-formio` library, or angular compiler doesn't see it well, although there is `node_modules/angular-formio/FormioBaseComponent.metadata.json` with the proper description:

```json
{
    "form": [{
        "__symbolic": "property",
        "decorators": [{
            "__symbolic": "call",
            "expression": {
                "__symbolic": "reference",
                "module": "@angular/core",
                "name": "Input",
                "line": 27,
                "character": 3
            }
        }]
    }],
    "submit": [{
        "__symbolic": "property",
        "decorators": [{
            "__symbolic": "call",
            "expression": {
                "__symbolic": "reference",
                "module": "@angular/core",
                "name": "Output",
                "line": 47,
                "character": 3
            }
        }]
    }]
}
```

# Building with angular-formio (succeeded)

We had to get the `angular-formio` library as well

```sh
git clone https://github.com/formio/angular-formio
# this version was the right version for the ``, later changed API and 
# had missing `angular-formio/components/loader/formio.loader` for an example
git checkout 4.7.x
```

```sh
cd angular-material-formio/angular-material-formio/node_modules/
mv angular-formio angular-formio-original
cd /Users/mprinc/data/development/libs/angular-formio
# this behaved well, compiled, but still client app didn't see the `form` attribute visible
# cp -r src ../angular-material-formio/angular-material-formio/node_modules/angular-formio
cp -r src ../angular-material-formio/angular-material-formio/projects/angular-material-formio/src/lib/angular-formio
cd /Users/mprinc/data/development/libs/angular-material-formio/angular-material-formio/
```

Now we have to change references from `node_module` to our new internal location:

```ts
import { FormioBaseComponent } from 'angular-formio/FormioBaseComponent';
import { FormioLoader } from 'angular-formio/components/loader/formio.loader';
```

into

```ts
import { FormioBaseComponent } from './angular-formio/FormioBaseComponent';
import { FormioLoader } from './angular-formio/components/loader/formio.loader';
```

It was necessary to be done in:
+ angular-material-formio/angular-material-formio/projects/angular-material-formio/src/lib/formio.component.ts
+ angular-material-formio/angular-material-formio/projects/angular-material-formio/src/lib/angular-material-formio.module.ts

Now we can build the new version:

```sh
ng build angular-material-formio
cd dist
npm pack
# outputs: angular-material-formio-1.3.5.tgz
```

More on [tar packages](colabo/development/INSTALL_PUZZLES.md)


We can now publish the `angular-material-formio-1.3.5.tgz` online: https://github.com/mprinc/angular-material-formio/releases/tag/1.3.5

To install it in your project, you can just refer to the built npm package in this release:

```json
"dependencies": {
    "angular-material-formio": "https://github.com/mprinc/angular-material-formio/releases/download/1.3.5/angular-material-formio-1.3.5.tgz",
    // ...
}
```


You might need to delete yarn cache to see the changes
```sh
yarn cache clean angular-material-formio
```