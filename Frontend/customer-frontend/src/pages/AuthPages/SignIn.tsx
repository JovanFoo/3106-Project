import PageMeta from "../../components/common/PageMeta";
import AuthLayout from "./AuthPageLayout";
import SignInForm from "../../components/auth/SignInForm";

export default function SignIn() {
  return (
    <>
      <PageMeta
        title="Hair Salon Customer"
        description="hair salon frontend customer"
      />
      <AuthLayout>
        <SignInForm />
      </AuthLayout>
    </>
  );
}
