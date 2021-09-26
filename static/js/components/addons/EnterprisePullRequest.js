import CommunityPullRequest from "./CommunityPullRequest.js";
import PullRequest from "./PullRequest.js";

const { tags } = owl;

class EnterprisePullRequest extends PullRequest {

    static get RelatedComponent() {
        return CommunityPullRequest;
    }

    /**
     * @override
     */
    static get headers() {
        if (!this.env.config.token) {
            throw new Error("No token set");
        }
        return Object.assign(super.headers, {
            Authorization: `Token ${this.env.config.token}`,
        });
    }
}

EnterprisePullRequest.description = "Search enterprise pull requests ...";
EnterprisePullRequest.repo = 'enterprise';
EnterprisePullRequest.title = "Enterprise";
EnterprisePullRequest.type = 'enterprise-pr';
EnterprisePullRequest.template = tags.xml`
    <div class="pull-request enterprise">
        <t t-if="env.config.token">${PullRequest.template}</t>
        <nav t-else="" class="alert alert-warning justify-content-center m-0">
            <span>You need to set up a<a href="#" target="_blank" class="alert-link m-1" t-on-click.prevent="trigger('redirect', 'settings')">GitHub personal access token</a>to scan the enterprise repository.</span>
        </nav>
    </div>`;

export default EnterprisePullRequest;
