import { useLocation } from "react-router-dom";
import UserArticleFormPage from "./UserArticleFormPage";
import { ARTICLE_STATUSES } from "../../components/user/userPortalShared";

export default function UserArchiveFormPage() {
  const location = useLocation();
  const returnPath = location.state?.returnTo || "/user/archive-pages";
  const prefill = location.state?.prefill || null;

  return (
    <UserArticleFormPage
      defaultStatus={ARTICLE_STATUSES.ARCHIVED}
      returnPath={returnPath}
      addHeading="ADD Archive page article"
      editHeading="Edit Archive page article"
      initialOverrides={prefill}
    />
  );
}
