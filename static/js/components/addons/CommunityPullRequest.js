import EnterprisePullRequest from "./EnterprisePullRequest.js";
import PullRequest from "./PullRequest.js";

const { tags } = owl;

class CommunityPullRequest extends PullRequest {

    static get RelatedComponent() {
        return EnterprisePullRequest;
    }
}

CommunityPullRequest.description = "Search community pull requests ...";
CommunityPullRequest.repo = "odoo";
CommunityPullRequest.title = "Community";
CommunityPullRequest.type = "community-pr";
CommunityPullRequest.template = tags.xml`
    <div class="pull-request enterprise">
        ${PullRequest.template}
    </div>`;

export default CommunityPullRequest;
