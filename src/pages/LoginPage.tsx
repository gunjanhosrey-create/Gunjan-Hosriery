import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { Loader2, LogOut, ShieldCheck, UserRound } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';

const initialAuthForm = {
  fullName: '',
  phone: '',
  email: '',
  password: '',
  confirmPassword: '',
  isDealer: false,
  gstNumber: '',
};

const initialProfileForm = {
  name: '',
  phone: '',
  addressLine: '',
  streetArea: '',
  village: '',
  city: '',
  state: '',
  pincode: '',
};

function GoogleIcon() {
  return (
    <svg aria-hidden="true" className="h-4 w-4" viewBox="0 0 24 24">
      <path
        fill="#4285F4"
        d="M21.6 12.23c0-.72-.06-1.25-.19-1.8H12v3.39h5.52c-.11.84-.73 2.1-2.1 2.95l-.02.11 3.05 2.31.21.02c1.91-1.73 2.94-4.26 2.94-6.98Z"
      />
      <path
        fill="#34A853"
        d="M12 22c2.7 0 4.96-.87 6.61-2.36l-3.24-2.44c-.87.59-2.03 1.01-3.37 1.01-2.64 0-4.89-1.73-5.69-4.13l-.11.01-3.17 2.4-.04.1A9.98 9.98 0 0 0 12 22Z"
      />
      <path
        fill="#FBBC05"
        d="M6.31 14.08A5.9 5.9 0 0 1 5.98 12c0-.72.12-1.43.31-2.08l-.01-.14-3.21-2.44-.1.04A9.82 9.82 0 0 0 2 12c0 1.61.39 3.13 1.08 4.45l3.23-2.37Z"
      />
      <path
        fill="#EA4335"
        d="M12 5.79c1.69 0 2.83.72 3.48 1.33l2.54-2.42C16.95 3.74 14.7 3 12 3a9.98 9.98 0 0 0-8.93 5.41l3.32 2.54c.81-2.4 3.06-4.16 5.61-4.16Z"
      />
    </svg>
  );
}

export default function LoginPage() {
  const { user, profile, loading, signUp, login, loginWithGoogle, forgotPassword, saveProfile, signOut } = useAuth();
  const [signupForm, setSignupForm] = useState(initialAuthForm);
  const [loginForm, setLoginForm] = useState(initialAuthForm);
  const [profileForm, setProfileForm] = useState(initialProfileForm);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!user || profile) return;

    setProfileForm((prev) => ({
      ...prev,
      name: prev.name || user.user_metadata?.full_name || user.user_metadata?.name || '',
      phone: prev.phone || user.user_metadata?.phone || '',
    }));
  }, [user, profile]);

  const handleGoogleAuth = async () => {
    setSubmitting(true);

    const { error } = await loginWithGoogle();

    if (error) {
      toast.error(error.message);
      setSubmitting(false);
      return;
    }

    toast.success('Redirecting to Google...');
  };

  if (loading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-red-600" />
      </div>
    );
  }

  if (user) {
    return <Navigate to="/account" replace />;
  }

  if (user && profile) {
    return (
      <div className="mx-auto flex min-h-[70vh] w-full max-w-3xl items-center px-4 py-12 sm:px-6 lg:px-8">
        <Card className="w-full border-slate-200 shadow-[0_18px_60px_-40px_rgba(15,23,42,0.35)]">
          <CardHeader className="space-y-3 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-red-600">
              <UserRound className="h-7 w-7" />
            </div>
            <CardTitle className="text-3xl font-bold text-slate-900">
              Welcome, {profile.name || user.email}
            </CardTitle>
            <CardDescription className="text-base text-slate-600">
              Your account and profile are ready.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-slate-600">
            <div className="rounded-2xl bg-slate-50 p-5">
              <p><span className="font-semibold text-slate-900">Email:</span> {user.email}</p>
              <p><span className="font-semibold text-slate-900">Phone:</span> {profile.phone || '-'}</p>
              <p><span className="font-semibold text-slate-900">City:</span> {profile.city || '-'}</p>
              <p><span className="font-semibold text-slate-900">Address:</span> {profile.address || '-'}</p>
              <p><span className="font-semibold text-slate-900">Pincode:</span> {profile.pincode || '-'}</p>
            </div>
            <Button variant="outline" className="w-full" onClick={() => void signOut()}>
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (user && !profile) {
    return (
      <div className="mx-auto flex min-h-[70vh] w-full max-w-4xl items-center px-4 py-12 sm:px-6 lg:px-8">
        <Card className="w-full border-slate-200 shadow-[0_18px_60px_-40px_rgba(15,23,42,0.35)]">
          <CardHeader>
            <CardTitle className="text-3xl font-bold text-slate-900">Complete Your Profile</CardTitle>
            <CardDescription>
              Add your contact and delivery details to complete your Gunjan Hosiery account.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form
              className="grid gap-4 md:grid-cols-2"
              onSubmit={async (e) => {
                e.preventDefault();
                setSubmitting(true);

                const combinedAddress = [
                  profileForm.addressLine.trim(),
                  profileForm.streetArea.trim(),
                  profileForm.village.trim(),
                  profileForm.state.trim(),
                ]
                  .filter(Boolean)
                  .join(', ');

                const { error } = await saveProfile({
                  name: profileForm.name,
                  phone: profileForm.phone,
                  address: combinedAddress,
                  city: profileForm.city,
                  pincode: profileForm.pincode,
                });

                if (error) {
                  toast.error(error.message);
                } else {
                  toast.success('Profile saved successfully');
                }

                setSubmitting(false);
              }}
            >
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  value={profileForm.name}
                  onChange={(e) => setProfileForm((prev) => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter your full name"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Mobile Number</Label>
                <Input
                  id="phone"
                  value={profileForm.phone}
                  onChange={(e) => setProfileForm((prev) => ({ ...prev, phone: e.target.value }))}
                  placeholder="Enter your mobile number"
                  required
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="address-line">Full Address</Label>
                <Input
                  id="address-line"
                  value={profileForm.addressLine}
                  onChange={(e) => setProfileForm((prev) => ({ ...prev, addressLine: e.target.value }))}
                  placeholder="House no, building, landmark"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="street-area">Street / Area</Label>
                <Input
                  id="street-area"
                  value={profileForm.streetArea}
                  onChange={(e) => setProfileForm((prev) => ({ ...prev, streetArea: e.target.value }))}
                  placeholder="Street or area"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="village">Village / Locality</Label>
                <Input
                  id="village"
                  value={profileForm.village}
                  onChange={(e) => setProfileForm((prev) => ({ ...prev, village: e.target.value }))}
                  placeholder="Village or locality"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  value={profileForm.city}
                  onChange={(e) => setProfileForm((prev) => ({ ...prev, city: e.target.value }))}
                  placeholder="Enter your city"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="state">State</Label>
                <Input
                  id="state"
                  value={profileForm.state}
                  onChange={(e) => setProfileForm((prev) => ({ ...prev, state: e.target.value }))}
                  placeholder="Enter your state"
                  required
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="pincode">Pincode</Label>
                <Input
                  id="pincode"
                  value={profileForm.pincode}
                  onChange={(e) => setProfileForm((prev) => ({ ...prev, pincode: e.target.value }))}
                  placeholder="Enter pincode"
                  required
                />
              </div>
              <div className="md:col-span-2">
                <Button type="submit" className="w-full" disabled={submitting}>
                  {submitting ? 'Saving...' : 'Save Profile'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto flex min-h-[70vh] w-full max-w-6xl items-center px-4 py-12 sm:px-6 lg:px-8">
      <div className="grid w-full gap-8 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="rounded-[32px] bg-gradient-to-br from-slate-950 via-slate-900 to-red-900 p-8 text-white shadow-[0_28px_80px_-40px_rgba(15,23,42,0.9)]">
          <div className="flex items-center gap-4">
            <img
              src="/images/gunjan-logo.png"
              alt="Gunjan Hosiery logo"
              className="h-16 w-16 rounded-full object-cover ring-2 ring-white/20"
            />
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-white/60">
                Welcome
              </p>
              <h1 className="mt-1 text-2xl font-black tracking-[0.04em] text-white sm:text-3xl">
                Gunjan Hosiery
              </h1>
            </div>
          </div>

          <div className="mt-8 max-w-md">
            <p className="text-sm font-semibold uppercase tracking-[0.28em] text-white/60">
              Secure Account Access
            </p>
            <h2 className="mt-3 text-3xl font-black leading-tight">
              Sign in to continue your shopping with Gunjan Hosiery.
            </h2>
            <p className="mt-4 text-base leading-7 text-white/80">
              Create a polished customer account, save delivery details, and enjoy a smoother
              shopping experience for every order.
            </p>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="text-sm font-semibold text-white">Fast checkout</p>
              <p className="mt-1 text-sm leading-6 text-white/70">Save your contact and delivery details for future orders.</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="text-sm font-semibold text-white">Dealer support</p>
              <p className="mt-1 text-sm leading-6 text-white/70">Bulk buyers can register as dealers with GST details.</p>
            </div>
          </div>
        </div>

        <Card className="border-slate-200 shadow-[0_18px_60px_-40px_rgba(15,23,42,0.35)]">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-slate-900">Account Access</CardTitle>
            <CardDescription>
              Create your account or log in to continue shopping with Gunjan Hosiery.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">Log In</TabsTrigger>
                <TabsTrigger value="signup">Sign Up</TabsTrigger>
              </TabsList>

              <TabsContent value="login" className="mt-6">
                <form
                  className="space-y-4"
                  onSubmit={async (e) => {
                    e.preventDefault();
                    setSubmitting(true);

                    const { error } = await login(loginForm.email, loginForm.password);

                    if (error) {
                      if (error.message.toLowerCase().includes('email not confirmed')) {
                        toast.error('Email not confirmed. Please verify your email first.');
                      } else if (error.message.toLowerCase().includes('invalid login credentials')) {
                        toast.error('Invalid email or password.');
                      } else {
                        toast.error(error.message);
                      }
                    } else {
                      toast.success('You have logged in successfully');
                    }

                    setSubmitting(false);
                  }}
                >
                  <div className="space-y-2">
                    <Label htmlFor="login-email">Email</Label>
                    <Input
                      id="login-email"
                      type="email"
                      value={loginForm.email}
                      onChange={(e) => setLoginForm((prev) => ({ ...prev, email: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="login-password">Password</Label>
                    <Input
                      id="login-password"
                      type="password"
                      value={loginForm.password}
                      onChange={(e) => setLoginForm((prev) => ({ ...prev, password: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="flex justify-between gap-3 rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-600">
                    <span className="flex items-center gap-2">
                      <ShieldCheck className="h-4 w-4 text-red-600" />
                      Secure login for your account
                    </span>
                    <button
                      type="button"
                      className="font-medium text-red-600 transition hover:text-red-700"
                      onClick={async () => {
                        if (!loginForm.email.trim()) {
                          toast.error('Please enter your email first');
                          return;
                        }

                        setSubmitting(true);
                        const { error } = await forgotPassword(loginForm.email);

                        if (error) {
                          toast.error(error.message);
                        } else {
                          toast.success('A password reset link has been sent to your email address.');
                        }

                        setSubmitting(false);
                      }}
                    >
                      Forgot password?
                    </button>
                  </div>
                  <Button type="submit" className="w-full" disabled={submitting}>
                    {submitting ? 'Signing in...' : 'Log In'}
                  </Button>
                  <div className="relative py-2">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t border-slate-200" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-white px-2 text-slate-500">or</span>
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={() => void handleGoogleAuth()}
                    disabled={submitting}
                  >
                    <GoogleIcon />
                    Continue with Google
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="signup" className="mt-6">
                <form
                  className="space-y-4"
                  onSubmit={async (e) => {
                    e.preventDefault();

                    if (signupForm.password !== signupForm.confirmPassword) {
                      toast.error('Passwords do not match');
                      return;
                    }

                    if (signupForm.isDealer && !signupForm.gstNumber.trim()) {
                      toast.error('GST number is required for dealer registration');
                      return;
                    }

                    setSubmitting(true);

                    const { error } = await signUp({
                      fullName: signupForm.fullName,
                      phone: signupForm.phone,
                      email: signupForm.email,
                      password: signupForm.password,
                      isDealer: signupForm.isDealer,
                      gstNumber: signupForm.gstNumber,
                    });

                    if (error) {
                      toast.error(error.message);
                    } else {
                      toast.success('Your account has been created. Please check your email for verification.');
                      setSignupForm(initialAuthForm);
                    }

                    setSubmitting(false);
                  }}
                >
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="signup-name">Full Name</Label>
                      <Input
                        id="signup-name"
                        type="text"
                        value={signupForm.fullName}
                        onChange={(e) => setSignupForm((prev) => ({ ...prev, fullName: e.target.value }))}
                        placeholder="Enter your full name"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-phone">Mobile Number</Label>
                      <Input
                        id="signup-phone"
                        type="tel"
                        value={signupForm.phone}
                        onChange={(e) => setSignupForm((prev) => ({ ...prev, phone: e.target.value }))}
                        placeholder="Enter your mobile number"
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-email">Email</Label>
                    <Input
                      id="signup-email"
                      type="email"
                      value={signupForm.email}
                      onChange={(e) => setSignupForm((prev) => ({ ...prev, email: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="signup-password">Password</Label>
                      <Input
                        id="signup-password"
                        type="password"
                        value={signupForm.password}
                        onChange={(e) => setSignupForm((prev) => ({ ...prev, password: e.target.value }))}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-confirm-password">Confirm Password</Label>
                      <Input
                        id="signup-confirm-password"
                        type="password"
                        value={signupForm.confirmPassword}
                        onChange={(e) => setSignupForm((prev) => ({ ...prev, confirmPassword: e.target.value }))}
                        required
                      />
                    </div>
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <label className="flex cursor-pointer items-start gap-3">
                      <input
                        type="checkbox"
                        checked={signupForm.isDealer}
                        onChange={(e) =>
                          setSignupForm((prev) => ({
                            ...prev,
                            isDealer: e.target.checked,
                            gstNumber: e.target.checked ? prev.gstNumber : '',
                          }))
                        }
                        className="mt-1 h-4 w-4 rounded border-slate-300 text-red-600 focus:ring-red-500"
                      />
                      <div>
                        <p className="text-sm font-semibold text-slate-900">Register as a Dealer</p>
                        <p className="mt-1 text-sm leading-6 text-slate-600">
                          Dealer accounts are for bulk buyers with a minimum order of 100 products.
                        </p>
                      </div>
                    </label>
                  </div>

                  {signupForm.isDealer && (
                    <div className="space-y-2">
                      <Label htmlFor="signup-gst">GST Number</Label>
                      <Input
                        id="signup-gst"
                        type="text"
                        value={signupForm.gstNumber}
                        onChange={(e) => setSignupForm((prev) => ({ ...prev, gstNumber: e.target.value }))}
                        placeholder="Enter GST number"
                        required
                      />
                    </div>
                  )}

                  <Button type="submit" className="w-full" disabled={submitting}>
                    {submitting ? 'Creating account...' : 'Create Account'}
                  </Button>
                  <div className="relative py-2">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t border-slate-200" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-white px-2 text-slate-500">or</span>
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={() => void handleGoogleAuth()}
                    disabled={submitting}
                  >
                    <GoogleIcon />
                    Sign up with Google
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
