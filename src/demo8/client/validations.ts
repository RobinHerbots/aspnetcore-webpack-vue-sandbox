import Veevalidate, { Validator } from 'vee-validate';
import Vue from 'vue';

const validationConfig: Veevalidate.Configuration = {
    classNames: { invalid: 'is-danger', valid: 'is-success', dirty: 'is-warning' },
    classes: true
};

Vue.use(Veevalidate, validationConfig);

Veevalidate.Validator.extend('aspnet', {

    getMessage(field, params, data) {
        return (data && data.message) || `${field} is not valid.`;
    },

    async validate(value, args) {
        let ref = <HTMLInputElement>document.querySelector(`[name="${args[0]}"]`);

        let validations = Object.keys(ref.dataset)
            .filter(x => x.startsWith('val'))
            .map(x => x.slice(3))
            .map(x => ({ [x === '' ? 'val' : x.toLowerCase()]: ref.dataset['val' + x] }))
            .reduce((acc, curr) => Object.assign(acc, curr), {});

        let valDef = mapValidations(validations);
        let validator = new Validator({
            [ref.name]: valDef
        }, { fastExit: false });

        let validated = await validator.validate(ref.name, ref.value);

        return {
            valid: validated,
            data: validated ? undefined : { message: validator.errors.first(ref.name) }
        };

        function mapValidations(validations: { [key: string]: string }) {
            if (!validations || validations['val'] !== 'true') return true;

            const ruleNames = Object.keys(Validator.rules);
            let vMap = Object.keys(validations).filter(x => x !== 'val')
                .map(x => {
                    let found = ruleNames.some(r => r === x);
                    if (found) return x;
                    switch (x) {
                        case "maxlength":
                            return `max:${validations["maxlengthmax"]}`;
                        case "minlength":
                            return `min:${validations["minlengthmin"]}`;
                        default:
                            return '';
                    }
                })
                .reduce((acc, curr) => {
                    if (curr === '') return acc;
                    return `${acc}|${curr}`;
                });
            return vMap;
        }
    }
});


