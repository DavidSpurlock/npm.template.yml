/**
 * Calculates new scroll positions for ng-scrollbars.
 * @param {Number} margin The margin by when to start scrolling
 * @param {Number} scrollBy Amount to scroll by
 */
const createMscScroller = ({ margin, scrollBy }) => {
    const model = {
        scroll: 0
    };

    return {
        /**
         * Set the current scroll position that ng-scrollbars currently has.
         * NOTE: You need to listen to the whileScrolling callback from ng-scrollbars.
         * @param {Number} top
         */
        setScrollPosition(top) {
            model.scroll = -top;
        },
        /**
         * Get the new scroll position, based on the targetTop and height of the scroller.
         * @param {Number} targetTop The top of the currently mouse-overed element.
         * @param {Number} scrollerHeight The height of the scrollbar.
         * @returns {number} The new scroll position.
         */
        scroll(targetTop, scrollerHeight) {
            const relativeY = targetTop - model.scroll;
            if (relativeY - margin / 2 <= 0 && model.scroll > 0) {
                return Math.max(model.scroll - scrollBy, 0);
            }

            if (relativeY - scrollerHeight + margin > 0) {
                return model.scroll + scrollBy;
            }
        }
    };
};

export default createMscScroller;
