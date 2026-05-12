import UserArticleFormPage from "./UserArticleFormPage";
import { ARTICLE_STATUSES } from "../../components/user/userPortalShared";

export default function UserCurrentIssueFormPage() {
  return (
    <UserArticleFormPage
      defaultStatus={ARTICLE_STATUSES.CURRENT_ISSUE}
      returnPath="/user/current-issue"
      addHeading="ADD Current issue page"
      editHeading="Edit Current issue page"
    />
  );
}
