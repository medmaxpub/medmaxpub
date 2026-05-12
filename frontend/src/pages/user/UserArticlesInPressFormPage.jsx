import UserArticleFormPage from "./UserArticleFormPage";
import { ARTICLE_STATUSES } from "../../components/user/userPortalShared";

export default function UserArticlesInPressFormPage() {
  return (
    <UserArticleFormPage
      defaultStatus={ARTICLE_STATUSES.IN_PRESS}
      returnPath="/user/articles-in-press"
      addHeading="ADD Articles in press page"
      editHeading="Edit Articles in press page"
    />
  );
}
