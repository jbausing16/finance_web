import { CircleArrowLeft, Eye, EyeOff } from "lucide-react";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Field, FieldGroup, FieldLabel } from "../ui/field";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useLoginMutation } from "@/store/api/authApi";
import { useTheme } from "../utils/theme-provider";
import {
  access,
  clearLogoutReason,
  loginSuccess,
} from "@/store/auth/authSlice";
import { useLazyGetSideBarSubQuery } from "@/store/api/AdministrationApi";
import { modules } from "@/lib/utils";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "../ui/input-otp";
import { REGEXP_ONLY_DIGITS } from "input-otp";
import type { RootState } from "@/store";
import {
  useChangePassMutation,
  useLazyCheckEmailQuery,
  useLazyCheckPINQuery,
} from "@/store/api/UsersApi";
import Lottie from "lottie-react";
import Success from "./../reusables/success.json";
import { Spinner } from "../ui/spinner";
import {
  FORCED_LOGOUT_REASON_STORAGE_KEY,
  getForcedLogoutMessage,
} from "@/store/api/baseQueryWithReauth";

function Login() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    type: 1,
  });

  const [passData, setPassData] = useState({
    pass1: "",
    pass2: "",
  });

  const [login] = useLoginMutation();

  const [view, setView] = useState<number>(1);

  const [signIn, setSignIn] = useState<boolean>(false);
  const [showOTP, setShowOTP] = useState<boolean>(false);

  const [sendingEmail, setSendingEmail] = useState(false);

  const [enaSubmit, setEnaSubmit] = useState(false);

  const [pin, setPin] = useState("");
  const [errorPin, setErrorPin] = useState(false);
  const [checkPin, setCheckPin] = useState(false);

  const dispatch = useDispatch();
  const logoutReason = useSelector(
    (state: RootState) => state.auth.logoutReason,
  );

  const [errorEmail, setErrorEmail] = useState(false);
  const [errorTextEmail, setErrorTextEmail] = useState("");

  const [errorPass, setErrorPass] = useState(false);
  const [errorTextPass, setErrorTextPass] = useState("");

  const [errorAll, setErrorAll] = useState(false);
  const [errorTextAll, setErrorTextAll] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showPassword1, setShowPassword1] = useState(false);
  const [showPassword2, setShowPassword2] = useState(false);

  const handleShowPassword = () => setShowPassword((prev) => !prev);

  const handleShowPassword2 = () => setShowPassword1((prev) => !prev);
  const handleShowPassword3 = () => setShowPassword2((prev) => !prev);

  const [emailDisabled, setEmailDisabled] = useState(false);
  const [showEmailConfirm, setShowEmailConfirm] = useState(false);

  const [btnChangePass, setBtnChangePass] = useState(true);

  const [getSideBarSub] = useLazyGetSideBarSubQuery();

  const handleLogin = async () => {
    setSignIn(true);
    const { email, password } = formData;

    if (formData.email === "" && formData.password === "") {
      // toast.error("Username/email and Password are required");
      setErrorEmail(true);
      setErrorTextEmail("Email is required.");
      setErrorPass(true);
      setErrorTextPass("Password is required.");
      setErrorAll(false);
      setErrorTextAll("");
    } else if (formData.email === "") {
      // toast.error("Username/email is required");
      setErrorEmail(true);
      setErrorTextEmail("Email is required.");
      setErrorPass(false);
      setErrorAll(false);
      setErrorTextAll("");
    } else if (formData.password === "") {
      // toast.error("Password is required");
      setErrorPass(true);
      setErrorTextPass("Password is required.");
      setErrorEmail(false);
      setErrorAll(false);
      setErrorTextAll("");
    } else {
      setErrorEmail(false);
      setErrorTextEmail("");
      setErrorPass(false);
      setErrorTextPass("");
      try {
        const checkstat = await login({ email, password }).unwrap();
        console.log(checkstat.land);

        setErrorAll(false);
        setErrorTextAll("");

        if (checkstat.success === true) {
          dispatch(clearLogoutReason());
          sessionStorage.removeItem(FORCED_LOGOUT_REASON_STORAGE_KEY);
          localStorage.setItem("uid", String(checkstat.uid));
          const sideBarSub = await getSideBarSub({}).unwrap();
          // console.log(sideBarSub?.data);
          dispatch(access({ access: sideBarSub?.data }));
          dispatch(loginSuccess({ role: checkstat.rid }));

          console.log("Landing URL: ", checkstat.land);
          if (checkstat.rid === 1) {
            navigate("/admin/client");
          } else {
            const url = modules.find(
              (item) => String(checkstat.land) === String(item.id),
            )?.url;
            console.log("URL get: ", url);
            setTimeout(() => {
              navigate(url || "");
            }, 400);
          }
        }
      } catch (err: any) {
        setSignIn(false);
        console.log("ERROR: ", err);
        // toast.error(err?.data?.message ?? `Invalid user`);
        setErrorAll(true);
        setErrorTextAll(err?.data?.message ?? `Invalid user`);
      }
    }
    setSignIn(false);
  };

  const [checkEmail] = useLazyCheckEmailQuery();
  const [checkPIN] = useLazyCheckPINQuery();

  const handleForgot = async () => {
    if (formData.email !== "") {
      setSendingEmail(true);
      try {
        const result = await checkEmail({ email: formData.email }).unwrap();
        console.log(result);
        if (result?.success) {
          setShowEmailConfirm(true);
          setEmailDisabled(true);
          setShowOTP(true);
          setEnaSubmit(true);
          setErrorEmail(false);
          setErrorTextEmail(``);
          setErrorAll(false);
          setErrorTextAll(``);
          setSendingEmail(false);
          // alert("Success");
        }
      } catch (err: any) {
        setShowOTP(false);
        // toast.error(err?.data?.message);
        setShowEmailConfirm(false);
        setEmailDisabled(false);
        setErrorEmail(true);
        setErrorTextEmail(err?.data?.message ?? `Invalid email`);
        setErrorAll(false);
        setErrorTextAll(``);
        setSendingEmail(false);
        // console.error(err);
      }
    } else {
      setErrorAll(true);
      setErrorTextAll(`Please enter email.`);
    }
  };

  const handleCheckPIN = async () => {
    try {
      const result = await checkPIN({
        email: formData.email,
        pin: pin,
      }).unwrap();
      console.log(result);
      if (result?.success) {
        toast.success("OTP Validated.");
        setErrorPin(false);
        setCheckPin(true);
        setEnaSubmit(false);
      }
    } catch (err: any) {
      setEnaSubmit(true);
      setErrorPin(true);
      setCheckPin(false);
      toast.error(err?.data?.message);
      console.error(err);
    }
  };

  //handleLoginChangePass
  const [changePass] = useChangePassMutation();
  const handleLoginChangePass = async () => {
    try {
      let formData1 = new FormData();
      const dat = {
        email: formData.email,
        pass: passData.pass1,
        pin: pin,
      };
      formData1.append("data", JSON.stringify(dat));

      let checkstat: any;
      checkstat = await changePass(formData1).unwrap();
      if (checkstat.success) {
        // toast.success(checkstat.message);
        setView(4);
      } else {
        toast.error(checkstat.message);
      }
    } catch (error) {
      console.log("Im error");
    }
  };

  useEffect(() => {
    const storedReason = sessionStorage.getItem(FORCED_LOGOUT_REASON_STORAGE_KEY);
    const reason = storedReason || logoutReason;

    if (!reason) {
      return;
    }

    const forcedLogoutMessage = getForcedLogoutMessage(reason);
    if (!forcedLogoutMessage) {
      dispatch(clearLogoutReason());
      sessionStorage.removeItem(FORCED_LOGOUT_REASON_STORAGE_KEY);
      return;
    }

    toast.error(forcedLogoutMessage);
    dispatch(clearLogoutReason());
    sessionStorage.removeItem(FORCED_LOGOUT_REASON_STORAGE_KEY);
  }, [dispatch, logoutReason]);

  useEffect(() => {
    if (pin.length === 6) {
      handleCheckPIN();
    }
    // console.log(pin.length);
  }, [pin]);

  useEffect(() => {
    if (passData.pass1 !== "" && passData.pass2 !== "") {
      if (passData.pass1 !== passData.pass2) {
        // toast.error("Passwords doesnt match");
        setBtnChangePass(true);
      } else {
        setBtnChangePass(false);
      }
    }
  }, [passData]);

  const { theme } = useTheme();

  // console.log("Theme: ", theme);
  // const [isDark, setIsDark] = useState(false);

  // useEffect(() => {
  //   const systemIsDark = window.matchMedia?.(
  //     "(prefers-color-scheme: dark)"
  //   ).matches;
  //   setIsDark(theme === "dark" || (theme === "system" && systemIsDark));
  // }, [theme]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const active = document.activeElement as HTMLElement;

      if (
        e.key === "Enter" &&
        (active?.id === "email" || active?.id === "password") &&
        !signIn
      ) {
        e.preventDefault();
        handleLogin();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [signIn, formData]);

  return (
    <>
      <div className="relative overflow-hidden bg-muted flex min-h-screen flex-col items-center justify-center gap-6 p-6 md:p-10">
        <img
          src="/oodc_header.png"
          className="absolute top-3 left-3 h-16 hidden sm:block"
        />
        <img
          src={`${theme === "dark" ? "/login1.1.png" : "/login1.png"}`}
          className="absolute -left-10 -bottom-10 hidden sm:block"
        />
        <img
          src={`${theme === "dark" ? "/login2.1.png" : "/login2.png"}`}
          className="absolute -right-20 -bottom-20 hidden sm:block"
        />
        <div className="flex w-full max-w-md flex-col gap-6 ">
          {view === 1 && (
            <div className="flex flex-col gap-6">
              <Card
                className={`z-50 ${theme === "dark" ? "border-gray-400" : ""}`}
              >
                <CardHeader className="text-center">
                  <CardTitle className="text-2xl font-bold">
                    Sign in to OOG Finance
                  </CardTitle>
                  {/* <CardDescription>Sign in to OOG Finance</CardDescription> */}
                </CardHeader>
                <CardContent>
                  <FieldGroup className="gap-2">
                    <Field className="gap-1">
                      <FieldLabel htmlFor="email">Email</FieldLabel>
                      <Input
                        id="email"
                        type="text"
                        required
                        onChange={(e) =>
                          setFormData({ ...formData, email: e.target.value })
                        }
                      />
                      <span className="text-red-500 text-sm">
                        {errorEmail && errorTextEmail}
                      </span>
                    </Field>
                    <Field className="gap-1">
                      <div className="flex items-center">
                        <FieldLabel htmlFor="password">Password</FieldLabel>
                      </div>
                      <div className="relative">
                        <div className="">
                          <Input
                            id="password"
                            type={showPassword ? "text" : "password"}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                password: e.target.value,
                              })
                            }
                          />
                        </div>
                        <div className="absolute top-2 right-0">
                          <button
                            type="button"
                            onClick={handleShowPassword}
                            className="mr-3 z-10"
                          >
                            {showPassword ? (
                              <Eye className="text-muted-foreground w-4" />
                            ) : (
                              <EyeOff className="text-muted-foreground w-4" />
                            )}
                          </button>
                        </div>
                      </div>
                      <span className="text-red-500 text-sm">
                        {errorPass && errorTextPass}
                      </span>
                      <a
                        className="ml-auto text-sm underline-offset-4 hover:underline text-right"
                        onClick={() => {
                          setView(2);
                          setErrorAll(false);
                          setErrorTextAll("");
                          setErrorEmail(false);
                          setErrorTextEmail("");
                          setErrorPass(false);
                          setErrorTextPass("");
                        }}
                      >
                        Forgot your password?
                      </a>
                    </Field>

                    <Field className="pt-4">
                      <Button onClick={handleLogin} variant={"primary"}>
                        Login
                      </Button>
                    </Field>
                  </FieldGroup>
                  <div className="my-4 ">
                    <span className="text-red-500 text-sm">
                      {errorAll && errorTextAll}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {view === 2 && (
            <div className="flex flex-col gap-6">
              <Card
                className={`z-50 ${theme === "dark" ? "border-gray-400" : ""}`}
              >
                <CardHeader className="">
                  <CardTitle className="flex items-center justify-between text-2xl font-bold">
                    <div>
                      <CircleArrowLeft
                        size={32}
                        className="text-blue-800"
                        onClick={() => {
                          setShowOTP(false);
                          setEnaSubmit(false);
                          setView(1);
                          setErrorAll(false);
                          setErrorTextAll("");
                          setErrorEmail(false);
                          setErrorTextEmail("");
                          setErrorPass(false);
                          setErrorTextPass("");
                          setShowEmailConfirm(false);
                          setEmailDisabled(false);
                        }}
                      />
                    </div>{" "}
                    <div>Forgot Password</div> <div>&nbsp;</div>
                  </CardTitle>
                  {/* <CardDescription>Sign in to OOG Finance</CardDescription> */}
                </CardHeader>
                <CardContent>
                  <FieldGroup className="gap-2">
                    <Field className="gap-1">
                      <FieldLabel htmlFor="email">Enter your email</FieldLabel>
                      <Input
                        id="email"
                        type="text"
                        required
                        onChange={(e) =>
                          setFormData({ ...formData, email: e.target.value })
                        }
                        disabled={emailDisabled}
                      />
                      <span className="text-red-500 text-sm">
                        {errorEmail && errorTextEmail}
                      </span>
                    </Field>

                    {showEmailConfirm && (
                      <span className="text-xs text-blue-700">
                        An OTP (One-Time Password) has been sent to the email
                        address you provided. Please check your inbox (and
                        spam/junk folder just in case) and enter the code here
                        to continue.
                      </span>
                    )}

                    {showOTP && (
                      <Field className="w-fit mt-4">
                        <FieldLabel htmlFor="digits-only">Enter OTP</FieldLabel>
                        <InputOTP
                          id="digits-only"
                          maxLength={6}
                          pattern={REGEXP_ONLY_DIGITS}
                          value={pin}
                          onChange={(value) => {
                            setPin(value);
                          }}
                        >
                          <InputOTPGroup className="*:data-[slot=input-otp-slot]:text-2xl space-x-2 w-full">
                            <InputOTPSlot
                              index={0}
                              className={`border ${
                                errorPin
                                  ? `border-red-500`
                                  : checkPin
                                    ? `border-green-500`
                                    : ``
                              }`}
                            />
                            <InputOTPSlot
                              index={1}
                              className={`border ${
                                errorPin
                                  ? `border-red-500`
                                  : checkPin
                                    ? `border-green-500`
                                    : ``
                              }`}
                            />
                            <InputOTPSlot
                              index={2}
                              className={`border ${
                                errorPin
                                  ? `border-red-500`
                                  : checkPin
                                    ? `border-green-500`
                                    : ``
                              }`}
                            />
                            <InputOTPSlot
                              index={3}
                              className={`border ${
                                errorPin
                                  ? `border-red-500`
                                  : checkPin
                                    ? `border-green-500`
                                    : ``
                              }`}
                            />
                            <InputOTPSlot
                              index={4}
                              className={`border ${
                                errorPin
                                  ? `border-red-500`
                                  : checkPin
                                    ? `border-green-500`
                                    : ``
                              }`}
                            />
                            <InputOTPSlot
                              index={5}
                              className={`border ${
                                errorPin
                                  ? `border-red-500`
                                  : checkPin
                                    ? `border-green-500`
                                    : ``
                              }`}
                            />
                          </InputOTPGroup>
                        </InputOTP>
                      </Field>
                    )}

                    {!showOTP ? (
                      <Field className="pt-4">
                        <Button
                          onClick={handleForgot}
                          variant={"primary"}
                          disabled={enaSubmit || sendingEmail}
                        >
                          {sendingEmail ? <Spinner /> : `Submit`}
                        </Button>
                      </Field>
                    ) : (
                      <Field className="pt-4">
                        <Button
                          onClick={() => setView(3)}
                          variant={"primary"}
                          disabled={enaSubmit || pin.length !== 6}
                        >
                          Submit
                        </Button>
                      </Field>
                    )}
                  </FieldGroup>
                  <div className="my-4 ">
                    <span className="text-red-500 text-sm">
                      {errorAll && errorTextAll}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {view === 3 && (
            <div className="flex flex-col gap-6">
              <Card
                className={`z-50 ${theme === "dark" ? "border-gray-400" : ""}`}
              >
                <CardHeader className="text-center">
                  <CardTitle className="text-2xl font-bold">
                    Change Password
                  </CardTitle>
                  {/* <CardDescription>Sign in to OOG Finance</CardDescription> */}
                </CardHeader>
                <CardContent>
                  <FieldGroup className="gap-2">
                    <Field className="gap-1">
                      <div className="flex items-center">
                        <FieldLabel htmlFor="password">Password</FieldLabel>
                      </div>
                      <div className="relative">
                        <div className="">
                          <Input
                            id="password"
                            type={showPassword1 ? "text" : "password"}
                            onChange={(e) =>
                              setPassData({
                                ...passData,
                                pass1: e.target.value,
                              })
                            }
                          />
                        </div>
                        <div className="absolute top-2 right-0">
                          <button
                            type="button"
                            onClick={handleShowPassword2}
                            className="mr-3 z-10"
                          >
                            {showPassword1 ? (
                              <Eye className="text-muted-foreground w-4" />
                            ) : (
                              <EyeOff className="text-muted-foreground w-4" />
                            )}
                          </button>
                        </div>
                      </div>
                    </Field>

                    <Field className="gap-1">
                      <div className="flex items-center">
                        <FieldLabel htmlFor="password">
                          Retype Password
                        </FieldLabel>
                      </div>
                      <div className="relative">
                        <div className="">
                          <Input
                            id="password"
                            type={showPassword2 ? "text" : "password"}
                            onChange={(e) =>
                              setPassData({
                                ...passData,
                                pass2: e.target.value,
                              })
                            }
                          />
                        </div>
                        <div className="absolute top-2 right-0">
                          <button
                            type="button"
                            onClick={handleShowPassword3}
                            className="mr-3 z-10"
                          >
                            {showPassword2 ? (
                              <Eye className="text-muted-foreground w-4" />
                            ) : (
                              <EyeOff className="text-muted-foreground w-4" />
                            )}
                          </button>
                        </div>
                      </div>
                    </Field>

                    <Field className="pt-4">
                      <Button
                        onClick={handleLoginChangePass}
                        variant={"primary"}
                        disabled={btnChangePass}
                      >
                        Change Password
                      </Button>
                    </Field>
                  </FieldGroup>
                  <div className="my-4 ">
                    <span className="text-red-500 text-sm">
                      {errorAll && errorTextAll}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {view === 4 && (
            <div className="flex flex-col gap-6">
              <Card
                className={`z-50 ${theme === "dark" ? "border-gray-400" : ""}`}
              >
                <CardHeader className="text-center">
                  <CardTitle className="text-2xl font-bold text-blue-700">
                    Password Successfully Changed
                  </CardTitle>
                  {/* <CardDescription>Sign in to OOG Finance</CardDescription> */}
                </CardHeader>
                <CardContent>
                  <FieldGroup className="gap-2">
                    <Lottie
                      animationData={Success}
                      loop={true}
                      className="h-72"
                    />
                    <Field className="pt-4">
                      <Button
                        onClick={() => {
                          setView(1);
                          setShowOTP(false);
                          setEnaSubmit(false);
                          setErrorAll(false);
                          setErrorTextAll("");
                          setErrorEmail(false);
                          setErrorTextEmail("");
                          setErrorPass(false);
                          setErrorTextPass("");
                          setShowEmailConfirm(false);
                          setEmailDisabled(false);
                          setPin("");
                          setCheckPin(false);
                        }}
                        variant={"primary"}
                      >
                        Back to Login
                      </Button>
                    </Field>
                  </FieldGroup>
                  <div className="my-4 ">
                    <span className="text-red-500 text-sm">
                      {errorAll && errorTextAll}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>

        {/* Copyright section */}
        <div
          className={`absolute bottom-0 pb-4 z-50 ${
            theme === "dark" ? "text-gray-300" : "text-gray-500"
          }`}
        >
          Copyright © 2024 | Privacy Policy | Powered by OneDigital
        </div>
      </div>
    </>
  );
}

export default Login;
