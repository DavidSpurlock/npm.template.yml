const SHOW_CLASS = 'show';

/* @ngInject */
const protonLoader = (dispatchers) => ({
    replace: true,
    scope: {},
    templateUrl: require('../../../templates/directives/ui/protonLoader.tpl.html'),
    link(scope, el) {
        const { on, unsubscribe } = dispatchers();

        on('AppModel', (e, { type, data = {} }) => {
            if (type === 'networkActivity' || type === 'loggingOut') {
                const method = data.value ? 'add' : 'remove';
                _rAF(() => el[0].classList[method](SHOW_CLASS));
            }
        });

        scope.$on('$destroy', unsubscribe);
    }
});
export default protonLoader;
