/* @ngInject */
function contactKeyPinning(contactPgpModel, dispatchers) {
    return {
        replace: true,
        restrict: 'E',
        scope: {},
        templateUrl: require('../../../templates/directives/contact/contactKeyPinning.tpl.html'),
        link(scope) {
            const { on, unsubscribe } = dispatchers();
            const set = (keys = []) => (scope.keyPinningEnabled = keys.length > 0);

            on('advancedSetting', (e, { type, data = {} }) => {
                if (type === 'updateKeys') {
                    scope.$applyAsync(() => {
                        set(data.keys);
                    });
                }
            });

            set(contactPgpModel.get('Keys'));

            scope.$on('$destroy', () => {
                unsubscribe();
            });
        }
    };
}
export default contactKeyPinning;
