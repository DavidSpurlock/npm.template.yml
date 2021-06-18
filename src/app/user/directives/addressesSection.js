/* @ngInject */
function addressesSection(addressModel, addressesModel, dispatchers, userType) {
    return {
        scope: {},
        replace: true,
        restrict: 'E',
        templateUrl: require('../../../templates/user/addressesSection.tpl.html'),
        link(scope) {
            const { on, unsubscribe } = dispatchers();
            const updateAddresses = () => {
                scope.$applyAsync(() => {
                    const { active, disabled } = addressesModel.getActive(undefined, { Send: 1 });

                    scope.activeAddresses = active;
                    scope.disabledAddresses = disabled;
                });
            };
            const updateUserType = () => {
                scope.$applyAsync(() => {
                    const { isAdmin, isFree } = userType();

                    scope.isAdmin = isAdmin;
                    scope.isFree = isFree;
                });
            };

            scope.itemMoved = false;
            scope.getDomain = ({ Email = '' } = {}) => {
                const [email] = Email.split('@');
                return email;
            };
            scope.aliasDragControlListeners = {
                containment: '.pm_form',
                accept(sourceItemHandleScope, destSortableScope) {
                    return sourceItemHandleScope.itemScope.sortableScope.$id === destSortableScope.$id;
                },
                dragStart() {
                    scope.itemMoved = true;
                },
                dragEnd() {
                    scope.itemMoved = false;
                },
                orderChanged() {
                    const addresses = scope.activeAddresses.concat(scope.disabledAddresses);
                    const newOrder = addresses.map(({ ID }) => ID);

                    addressModel.saveOrder(newOrder);
                }
            };

            on('updateUser', () => {
                if (!scope.itemMoved) {
                    updateAddresses();
                }
                updateUserType();
            });

            on('addressModel', (e, { type }) => {
                if (type === 'generateKey.success') {
                    updateAddresses();
                }
            });

            updateAddresses();
            updateUserType();

            scope.$on('$destroy', unsubscribe);
        }
    };
}
export default addressesSection;
