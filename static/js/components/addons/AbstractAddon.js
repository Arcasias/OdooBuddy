const { Component } = owl;

class AbstractAddon extends Component {

    //-------------------------------------------------------------------------
    // Static
    //-------------------------------------------------------------------------

    /**
     * @abstract
     * @static
     * @async
     * @param {string} query
     * @returns {Promise<Object[]>}
     */
    static async search() {
        return {};
    }
}

export default AbstractAddon;
