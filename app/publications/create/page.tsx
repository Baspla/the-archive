
import AuthorSelectServer from "./AuthorSelectServer";
import CreatePublicationForm from "./CreatePublicationForm";

export default function Page() {
  return (
    <main>
      <h1>Create Publication</h1>
      <AuthorSelectServer>
        {(authors) => <CreatePublicationForm authors={authors} />}
      </AuthorSelectServer>
    </main>
  );
}
