/* @ngInject */
function contactPublicKeyTable() {
    return {
        restrict: 'E',
        templateUrl: require('../../../templates/directives/contact/contactPublicKeyTable.tpl.html'),
        scope: {
            items: '=',
            enableDelete: '=',
            enableTrust: '='
        }
    };
}
export default contactPublicKeyTable;
