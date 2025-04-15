import PageMeta from "../../components/common/PageMeta";
import AuthLayout from "./AuthPageLayout";
import ForgetPasswordForm from "../../components/auth/ForgetPasswordForm";

export default function SignIn() {
  return (
    <>
      <PageMeta
        title="Forget Password"
        description="This is a Dashboard page for QB House Store Manager Sign in Page"
      />
      <AuthLayout>
        <ForgetPasswordForm />
      </AuthLayout>
    </>
  );
}
