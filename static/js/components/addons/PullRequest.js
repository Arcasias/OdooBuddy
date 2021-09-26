import AbstractAddon from "./AbstractAddon.js";

const { hooks, utils } = owl;
const { useState } = hooks;

const URL_REGEX = /https?:\/\/[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/g;
const GITHUB_REGEX = /github\.com\/[\w]+\/[\w]+\/pull\/[\d]+/;
const TASK_REGEX = /\b(opw|id|(task([-_\s]?id)?))[\s-_:#]*\d{7}\b/gi;

//-----------------------------------------------------------------------------
// Helpers
//-----------------------------------------------------------------------------

/**
 * @param {string} color
 * @returns {string}
 */
function reverseColor(color) {
    const r = parseInt(color.slice(0, 2), 16);
    const g = parseInt(color.slice(2, 4), 16);
    const b = parseInt(color.slice(4, 6), 16);
    return r + g + b > (255 + 255 + 255) / 2 ? "#000000" : "#ffffff";
}

/**
 * @param {string} body
 * @returns {string}
 */
function formatBody(body) {
    return utils.escape(body).trim()
        .replace(/[\n\r\v]/g, "<br/>")
        .replace(/(<br\/>){2}/g, "<br/>")
        .replace(/(<br\/>){2,}/g, "<br/><br/>")
        .replace(URL_REGEX, url => {
            if (GITHUB_REGEX.test(url)) {
                const [owner, repo, pull, id] = url.split("/").slice(3);
                return `<a href="${url}" target="_blank" title="Open pull request">${owner}/${repo}#${id}</a>`;
            } else {
                return `<a href="${url}" target="_blank" title="Open URL">${url}</a>`;
            }
        })
        .replace(TASK_REGEX, task => {
            const url = PullRequest.env.odooTaskUrl(task.slice(-7));
            return `<a href="${url}" target="_blank" title="Open task">${task}</a>`;
        });
}

//-----------------------------------------------------------------------------
// Components
//-----------------------------------------------------------------------------

class PullRequest extends AbstractAddon {

    constructor() {
        super(...arguments);

        this.state = useState({
            extraInfo: false,
            isFavorite: false,
            loading: false,
        });

    }

    async willStart() {
        this.state.isFavorite = this.env.favorites[this.static.type].some(
            f => f.id === this.props.id
        );
    }

    get static() {
        return this.constructor;
    }

    //-------------------------------------------------------------------------
    // Private
    //-------------------------------------------------------------------------

    /**
     * @async
     * @returns {Promise<Object>}
     */
    async _getExtraInfo() {
        const url = `https://api.github.com/repos/odoo/${this.static.repo}/pulls/${this.props.number}`;
        const options = {
            method: "GET",
            headers: this.static.headers,
        };
        const [prInfo, relatedPRs] = await Promise.all([
            this.env.getJSON(url, {}, options),
            this.static.searchRelated(this.props.title),
        ]);
        console.log({ prInfo, relatedPRs });
        const extraInfo = {
            branch: prInfo.head.ref,
            commentsCount: prInfo.comments,
            diff: {
                added: prInfo.additions,
                files: prInfo.changed_files,
                removed: prInfo.deletions,
            },
            commitsCount: prInfo.commits,
            target: prInfo.base.ref,
        };
        if (relatedPRs.length) {
            extraInfo.relatedPR = relatedPRs[0];
        }
        return extraInfo;
    }

    //-------------------------------------------------------------------------
    // Handlers
    //-------------------------------------------------------------------------

    /**
     * @async
     * @returns {Promise}
     */
    async onToggleExpanded() {
        if (this.state.extraInfo) {
            this.state.extraInfo = false;
        } else {
            this.state.loading = true;
            this.state.extraInfo = await this._getExtraInfo();
            this.state.loading = false;
        }
    }

    /**
     *
     */
    onToggleFavorite() {
        if (this.state.isFavorite) {
            this.state.isFavorite = false;
            this.env.favorites[this.static.type] = this.env.favorites[this.static.type].filter(
                f => f.id !== this.props.id
            );
        } else {
            this.state.isFavorite = true;
            const toStore = Object.assign({}, this.props);
            this.env.favorites[this.static.type].push(toStore);
        }
        this.env.storageSet(this.static.type, this.env.favorites[this.static.type]);
    }

    //-------------------------------------------------------------------------
    // Static
    //-------------------------------------------------------------------------

    /**
     * @static
     * @property
     * @returns {Object}
     */
    static get headers() {
        return {
            Accept: "application/vnd.github.v3+json",
        };
    }

    /**
     * @override
     */
    static async search(query, page = 1) {
        const url = "https://api.github.com/search/issues";
        const params = {
            page,
            per_page: 10,
            q: [query, `repo:odoo/${this.repo}`, "is:pr", "is:open"].join("+"),
        };
        const options = {
            method: "GET",
            headers: this.headers,
        };
        const { items } = await this.env.getJSON(url, params, options);
        return items.map(pr => this.formatPullRequest(pr));
    }

    static async searchRelated() {
        return this.RelatedComponent.search(...arguments);
    }

    /**
     * @static
     * @returns {Object}
     */
    static formatPullRequest(pr) {
        return {
            url: pr.html_url,
            id: pr.id,
            labels: pr.labels.reduce(
                (labels, label, index) => Object.assign(labels, {
                    [index]: {
                        id: label.id,
                        name: label.name,
                        color: "#" + label.color,
                        reverseColor: reverseColor(label.color),
                    },
                }),
                {}
            ),
            number: pr.number,
            title: pr.title,
            body: formatBody(pr.body),
            type: this.type,
        };
    }
}

PullRequest.props = Object.assign({}, AbstractAddon.props, {
    url: String,
    id: Number,
    labels: Object,
    number: Number,
    title: String,
    body: String,
    type: String,
    embed: { type: Boolean, optional: true },
});
PullRequest.template = `
    <div class="pr-header" t-on-click="onToggleExpanded">
        <div class="pr-left">
            <a class="mr-2"
                title="Open PR in a new tab"
                target="_blank"
                t-att-href="props.url"
                t-esc="'#' + props.number"
                t-on-click.stop=""
            />
            <span t-esc="props.title"/>
            <span class="foldable-badges">
                <span t-foreach="props.labels" t-as="labelId" t-key="labelId"
                    class="foldable-badge"
                    t-att-title="props.labels[labelId].name"
                    t-attf-style="
                        color: {{ props.labels[labelId].reverseColor }};
                        background-color: {{ props.labels[labelId].color }};
                    ">
                    <span class="foldable-badge-text" t-esc="props.labels[labelId].name"/>
                </span>
            </span>
        </div>
        <div class="pr-right">
            <i t-attf-class="text-muted mr-2 fa fa-caret-{{ state.extraInfo ? 'down' : 'right' }}"/>
            <i t-if="!props.embed" t-attf-class="{{ state.isFavorite ? 'fas' : 'far' }} fa-heart"
                t-att-title="state.isFavorite ? env._('Remove from favorites') : env._('Mark as favorite')"
                t-on-click.stop="onToggleFavorite(props)"
            />
        </div>
    </div>
    <div t-if="state.loading" class="pr-body text-muted mt-2 p-2 bg-light">
        <span class="text-muted">Loading <i class="spin fas fa-sync-alt"/></span>
    </div>
    <t t-elif="state.extraInfo">
        <nav class="pr-info navbar alert-info">
            <div class="branch info-branch text-primary">
                <span t-esc="state.extraInfo.target"/>:<span t-esc="state.extraInfo.branch"/>
            </div>
            <div class="badges">
                <span class="badge text-success" title="lines added">
                    +<t t-esc="state.extraInfo.diff.added"/>
                </span>
                <span class="badge text-danger" title="lines removed">
                    -<t t-esc="state.extraInfo.diff.removed"/>
                </span>
                <a class="badge text-primary" t-att-href="props.url" target="_blank" title="comments">
                    <t t-esc="state.extraInfo.commentsCount"/>
                    <i class="fas fa-comment"></i>
                </a>
                <a class="badge text-primary" t-att-href="props.url + '/commits'" target="_blank" title="commits">
                    <t t-esc="state.extraInfo.commitsCount"/>
                    <i class="fab fa-github"></i>
                </a>
                <a class="badge text-primary" t-att-href="props.url + '/files?file-filters%5B%5D=&amp;w=1'" target="_blank" title="files changed">
                    <t t-esc="state.extraInfo.diff.files"/>
                    <i class="fas fa-file"/>
                </a>
            </div>
            <t t-if="!props.embed and state.extraInfo.relatedPR"
                t-component="static.RelatedComponent"
                t-props="state.extraInfo.relatedPR"
                embed="true"
            />
        </nav>
        <div class="pr-body">
            <t t-if="props.body" t-raw="props.body"/>
            <span class="text-muted font-italic" t-else="">No description available</span>
        </div>
    </t>`;

export default PullRequest;
