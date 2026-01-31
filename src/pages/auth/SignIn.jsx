import { useNavigate, Link } from "react-router-dom";
import { useEffect, useMemo, useRef, useState } from "react";
import { useDispatch } from "react-redux";
import { Mail, Rocket, X, Sparkles, CheckCircle2, Heart, Star } from "lucide-react";
import Button from "../../components/Button";
import PasswordInput from "../../components/PasswordInput";
import AuthImageCarousel from "../../components/AuthImageCarousel";
import { setCredentials } from "../../store/slices/authSlice";
import { getRoleDashboard } from "../../utils/roleRoutes";
import { getLaunchStatus } from "../../api/launch";
import { confettiLong, confettiBurst, confettiEpicCelebration, confettiFullPage } from "../../utils/confetti";

const SignIn = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState(false);
  const [launchState, setLaunchState] = useState({
    loading: true,
    isLaunched: null, // null = unknown
    error: "",
  });
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [scheduledAtIso, setScheduledAtIso] = useState(null);
  const [launchPhase, setLaunchPhase] = useState(null);
  const prevLaunchedRef = useRef(null);
  const [launchToastVisible, setLaunchToastVisible] = useState(false);
  const [showLaunchAlert, setShowLaunchAlert] = useState(false);
  const [showCheers, setShowCheers] = useState(false);
  const toastTimerRef = useRef(null);
  const refreshTimerRef = useRef(null);
  const countdownTimerRef = useRef(null);
  const cheersTimerRef = useRef(null);
  const REFRESH_MS = 10000;
  const LAUNCH_ALERT_DISMISSED_KEY = "brintelli_launch_alert_dismissed";

  const clearTimers = () => {
    if (refreshTimerRef.current) {
      clearTimeout(refreshTimerRef.current);
      refreshTimerRef.current = null;
    }
    if (countdownTimerRef.current) {
      clearInterval(countdownTimerRef.current);
      countdownTimerRef.current = null;
    }
  };

  const fmtTime = (sec) => {
    const s = Math.max(0, Number(sec) || 0);
    const mm = String(Math.floor(s / 60)).padStart(2, "0");
    const ss = String(s % 60).padStart(2, "0");
    return `${mm}:${ss}`;
  };

  const secondsLabel = useMemo(() => fmtTime(secondsLeft), [secondsLeft]);

  const fmtCountdown = (totalSeconds) => {
    const s = Math.max(0, Number(totalSeconds) || 0);
    const days = Math.floor(s / 86400);
    const hours = Math.floor((s % 86400) / 3600);
    const minutes = Math.floor((s % 3600) / 60);
    const seconds = s % 60;
    const hh = String(hours).padStart(2, "0");
    const mm = String(minutes).padStart(2, "0");
    const ss = String(seconds).padStart(2, "0");
    return days > 0 ? `${days}d ${hh}:${mm}:${ss}` : `${hh}:${mm}:${ss}`;
  };

  const checkLaunchStatus = async () => {
    clearTimers();
    setLaunchState((prev) => ({ ...prev, loading: true, error: "" }));
    try {
      const data = await getLaunchStatus();
      const isLaunched = !!data?.isLaunched;
      setScheduledAtIso(data?.scheduledAt || null);
      setLaunchPhase(data?.phase || null);
      setLaunchState({ loading: false, isLaunched, error: "" });
      if (prevLaunchedRef.current === false && isLaunched === true) {
        // Epic celebration with full page confetti
        confettiEpicCelebration();
        setLaunchToastVisible(true);
        setShowCheers(true);
        // Show alert if not previously dismissed
        const dismissed = sessionStorage.getItem(LAUNCH_ALERT_DISMISSED_KEY);
        if (!dismissed) {
          setShowLaunchAlert(true);
        }
        if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
        toastTimerRef.current = setTimeout(() => setLaunchToastVisible(false), 5000);
        if (cheersTimerRef.current) clearTimeout(cheersTimerRef.current);
        cheersTimerRef.current = setTimeout(() => setShowCheers(false), 8000);
      }
      // Also show alert if app is already launched when page loads (first visit)
      if (isLaunched && !showLaunchAlert && prevLaunchedRef.current === null) {
        const dismissed = sessionStorage.getItem(LAUNCH_ALERT_DISMISSED_KEY);
        if (!dismissed) {
          confettiEpicCelebration();
          setShowLaunchAlert(true);
          setShowCheers(true);
          if (cheersTimerRef.current) clearTimeout(cheersTimerRef.current);
          cheersTimerRef.current = setTimeout(() => setShowCheers(false), 8000);
        }
      }
      prevLaunchedRef.current = isLaunched;

      if (!isLaunched) {
        const scheduledAt = data?.scheduledAt ? new Date(data.scheduledAt) : null;
        const scheduledMs = scheduledAt && !Number.isNaN(scheduledAt.getTime()) ? scheduledAt.getTime() : null;
        const now = Date.now();
        const end = scheduledMs || now + REFRESH_MS;

        setSecondsLeft(Math.max(0, Math.ceil((end - now) / 1000)));
        countdownTimerRef.current = setInterval(() => {
          const left = Math.max(0, Math.ceil((end - Date.now()) / 1000));
          setSecondsLeft(left);
        }, 250);

        // Once scheduled time is reached, poll more frequently to detect manual launch quickly.
        const isEventLive = scheduledMs ? now >= scheduledMs : false;
        const nextCheckInMs = isEventLive ? 3000 : Math.min(REFRESH_MS, Math.max(1000, end - now));
        refreshTimerRef.current = setTimeout(() => {
          checkLaunchStatus();
        }, nextCheckInMs);
      }
    } catch (e) {
      setLaunchState({
        loading: false,
        isLaunched: false,
        error: e?.message || "Unable to check launch status",
      });
      setLaunchPhase(null);

      // Keep a timer even on error, and retry automatically.
      const start = Date.now();
      const end = start + REFRESH_MS;
      setSecondsLeft(Math.ceil(REFRESH_MS / 1000));
      countdownTimerRef.current = setInterval(() => {
        const left = Math.max(0, Math.ceil((end - Date.now()) / 1000));
        setSecondsLeft(left);
      }, 250);
      refreshTimerRef.current = setTimeout(() => {
        checkLaunchStatus();
      }, REFRESH_MS);
    }
  };

  useEffect(() => {
    checkLaunchStatus();
    return () => {
      clearTimers();
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
      if (cheersTimerRef.current) clearTimeout(cheersTimerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Trigger confetti when modal opens
  useEffect(() => {
    if (showLaunchAlert) {
      // Additional confetti burst when modal appears
      setTimeout(() => {
        confettiFullPage(3000);
      }, 300);
    }
  }, [showLaunchAlert]);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

const handleSubmit = async (event) => {
  event.preventDefault();
  setIsLoading(true);

  try {
    const { authAPI } = await import("../../api/auth");

    console.log("📤 Sending login request:", {
      email: formData.email,
      password: "******",
    });

    const response = await authAPI.login(
      formData.email,
      formData.password
    );

    // FULL RESPONSE LOG
    console.log("✅ LOGIN API FULL RESPONSE:", response);

    // IMPORTANT: depending on your authAPI
    const loginData = response.data?.data || response.data || response;

    console.log("🟢 LOGIN DATA:", loginData);
    console.log("🟡 TOKEN:", loginData?.token);
    console.log("🟣 REFRESH TOKEN:", loginData?.refreshToken);
    console.log("🔵 USER:", loginData?.user);

    if (!loginData?.token) {
      throw new Error("JWT token missing from login response");
    }

    // SAVE TO REDUX
    dispatch(
      setCredentials({
        user: loginData.user,
        token: loginData.token,
        refreshToken: loginData.refreshToken,
      })
    );

    console.log("✅ TOKEN SAVED TO REDUX");

    // ROLE BASED NAVIGATION
    const dashboardRoute = getRoleDashboard(loginData.user.role);
    navigate(dashboardRoute);

  } catch (error) {
    console.error("❌ LOGIN ERROR:", error);
    alert(error.message || "Login failed");
  } finally {
    setIsLoading(false);
  }
};

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const launchToast = launchToastVisible ? (
    <div className="fixed left-1/2 top-6 z-[10001] -translate-x-1/2 rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-3 text-sm font-semibold text-emerald-900 shadow-lg">
      It&apos;s been launched!
    </div>
  ) : null;

  // Launch landing (blocks login until launched)
  if (launchState.isLaunched === false) {
    const scheduledText = scheduledAtIso
      ? new Date(scheduledAtIso).toLocaleString("en-IN", {
          timeZone: "Asia/Kolkata",
          day: "numeric",
          month: "short",
          year: "numeric",
          hour: "numeric",
          minute: "2-digit",
          hour12: true,
        })
      : null;
    const countdownLabel = fmtCountdown(secondsLeft);
    const posterSrc = encodeURI("/hemachandran sir .png");
    const isEventLive = launchPhase === "EVENT_LIVE" || (scheduledAtIso && secondsLeft === 0);

    return (
      <div className="relative min-h-screen overflow-hidden bg-white text-slate-900">
        {launchToast}
        {/* dotted background (Aceternity-style) */}
        <div
          className={[
            "pointer-events-none absolute inset-0",
            "[background-size:20px_20px]",
            "[background-image:radial-gradient(#d4d4d4_1px,transparent_1px)]",
            "dark:[background-image:radial-gradient(#404040_1px,transparent_1px)]",
          ].join(" ")}
        />
        {/* radial fade mask */}
        <div className="pointer-events-none absolute inset-0 bg-white [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]" />
        {/* subtle gradients */}
        <div className="pointer-events-none absolute -left-40 -top-40 h-[520px] w-[520px] rounded-full bg-indigo-500/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-48 -right-48 h-[620px] w-[620px] rounded-full bg-sky-400/10 blur-3xl" />

        {/* corner decorations */}
        <img
          src="/Corners.png"
          alt=""
          className="pointer-events-none absolute left-5 top-5 w-16 opacity-90 sm:left-8 sm:top-8 sm:w-24 md:w-32"
          style={{ transform: "rotate(180deg)" }}
        />
        <img
          src="/Corners.png"
          alt=""
          className="pointer-events-none absolute right-5 top-5 w-16 opacity-90 sm:right-8 sm:top-8 sm:w-24 md:w-32"
          style={{ transform: "rotate(270deg)" }}
        />
        <img
          src="/Corners.png"
          alt=""
          className="pointer-events-none absolute bottom-5 left-5 w-16 opacity-90 sm:bottom-8 sm:left-8 sm:w-24 md:w-32"
          style={{ transform: "rotate(90deg)" }}
        />
        <img
          src="/Corners.png"
          alt=""
          className="pointer-events-none absolute bottom-5 right-5 w-16 opacity-90 sm:bottom-8 sm:right-8 sm:w-24 md:w-32"
          style={{ transform: "rotate(0deg)" }}
        />

        <div className="relative mx-auto flex min-h-screen w-full max-w-6xl flex-col justify-center gap-14 px-8 py-16 sm:px-14 sm:py-20 lg:px-20">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <img src="/logo.png" alt="Brintelli Logo" className="h-12 w-auto sm:h-14" />
            </div>
            <div className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-700 shadow-sm">
              Pre-launch
            </div>
          </div>

          <div className="grid items-start gap-12 md:grid-cols-2 md:gap-16">
            <div className="space-y-5">
              <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-700 shadow-sm">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                {isEventLive ? "Launch event is going on!" : "Official Launch Ceremony"}
              </div>

              <h1 className="text-balance text-3xl font-extrabold leading-tight text-slate-900 sm:text-4xl lg:text-5xl">
                {isEventLive ? "We’re live now." : "We’re almost ready."}
                <span className="block bg-gradient-to-r from-indigo-700 via-slate-900 to-sky-700 bg-clip-text text-transparent">
                  {isEventLive ? "Launch event is going on!" : "The LMS opens soon."}
                </span>
              </h1>

              <p className="text-sm leading-relaxed text-slate-600">
                {isEventLive
                  ? "The launch event is currently in progress. This login page will unlock automatically once the application is launched."
                  : "This login page will automatically unlock when the application is launched."}
              </p>

              {scheduledText ? (
                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                  <div className="text-xs font-semibold tracking-widest text-slate-500">SCHEDULED LAUNCH (IST)</div>
                  <div className="mt-1 text-sm font-semibold text-slate-900">{scheduledText} IST</div>
                  <div className="mt-5 grid gap-2">
                    <div className="text-xs font-semibold text-slate-500">{isEventLive ? "STATUS" : "COUNTDOWN"}</div>
                    {isEventLive ? (
                      <div className="inline-flex items-center gap-2 text-2xl font-extrabold text-slate-900">
                        <span className="inline-flex h-2.5 w-2.5 animate-pulse rounded-full bg-emerald-500" />
                        LIVE
                      </div>
                    ) : (
                      <div className="text-3xl font-extrabold tracking-widest text-slate-900 sm:text-4xl">
                        {scheduledAtIso ? countdownLabel : secondsLabel}
                      </div>
                    )}
                    {launchState.error ? (
                      <div className="text-xs text-rose-600">{launchState.error}</div>
                    ) : null}
                  </div>
                </div>
              ) : (
                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                  <div className="text-xs font-semibold text-slate-500">Next status check in</div>
                  <div className="mt-3 text-3xl font-extrabold tracking-widest text-slate-900 sm:text-4xl">{secondsLabel}</div>
                  {launchState.error ? (
                    <div className="mt-2 text-xs text-rose-600">{launchState.error}</div>
                  ) : null}
                </div>
              )}

              <p className="text-xs text-slate-500">
                Status refresh happens automatically.
              </p>
            </div>

            <div className="mx-auto w-full max-w-sm sm:max-w-md lg:max-w-lg">
              <div className="mb-4 text-center">
                <div className="text-xs font-semibold tracking-widest text-slate-500">OFFICIAL LAUNCH BY</div>
                <div className="mt-1 text-xl font-extrabold text-slate-900 sm:text-2xl">
                  Dr Hemachandran Ravikumar
                </div>
                <div className="mt-1 text-xs font-semibold text-slate-600">
                  Scientist | International Research Leader
                </div>
              </div>

              <div className="relative overflow-hidden rounded-[32px] border-2 border-indigo-200/50 bg-gradient-to-br from-indigo-50/50 to-purple-50/50 p-4 sm:p-6 shadow-[0_18px_50px_rgba(15,23,42,0.14)] backdrop-blur-sm">
                {/* Background Image Layer */}
                <div 
                  className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-40 rounded-3xl blur-[2px] scale-110"
                  style={{ backgroundImage: 'url(/background.png)' }}
                />
                
                {/* Multiple Gradient Overlays for depth and contrast */}
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-indigo-900/15 via-purple-900/10 to-transparent rounded-3xl" />
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-slate-900/10 via-transparent to-slate-100/30 rounded-3xl" />
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/20 to-transparent rounded-3xl" />
                
                {/* Decorative glow effect */}
                <div className="pointer-events-none absolute -inset-1 bg-gradient-to-r from-indigo-400/20 via-purple-400/20 to-pink-400/20 rounded-3xl blur-xl opacity-50" />
                
                {/* Hemachandran Sir Image - Foreground */}
                <div className="relative z-10 transform transition-transform hover:scale-[1.02] duration-300">
                  <img
                    src={posterSrc}
                    alt="Dr. Hemachandran Ravikumar - Launch poster"
                    className="w-full rounded-3xl object-contain"
                    style={{ 
                      mixBlendMode: 'normal',
                      filter: 'drop-shadow(0 15px 35px rgba(0, 0, 0, 0.4)) drop-shadow(0 5px 15px rgba(99, 102, 241, 0.3))',
                      imageRendering: 'high-quality'
                    }}
                  />
                </div>
                
                {/* Subtle border glow */}
                <div className="pointer-events-none absolute inset-0 rounded-3xl border-2 border-white/20" />
              </div>
            </div>
          </div>

          <div className="pt-2 text-center text-xs text-slate-500">
            © {new Date().getFullYear()} Brintelli Academy
          </div>
        </div>
      </div>
    );
  }

  // After launch: show login page, but still play the celebration once if it just launched
  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/50 to-indigo-50/50 relative overflow-hidden">
      {launchToast}
      
      {/* Cheers Overlay - Full Page Celebration */}
      {showCheers && (
        <div className="fixed inset-0 z-[9999] pointer-events-none">
          {/* Cheers Text - Multiple Animated Elements */}
          <div className="absolute top-20 left-1/2 -translate-x-1/2 animate-in fade-in slide-in-from-top-4 duration-500">
            <div className="text-6xl sm:text-7xl md:text-8xl font-extrabold bg-gradient-to-r from-emerald-500 via-blue-500 to-indigo-500 bg-clip-text text-transparent animate-bounce drop-shadow-2xl">
              🎉 CHEERS! 🎉
            </div>
          </div>
          
          <div className="absolute top-32 left-1/4 animate-in fade-in slide-in-from-left-4 duration-700" style={{ animationDelay: '200ms' }}>
            <div className="text-5xl sm:text-6xl animate-bounce drop-shadow-lg" style={{ animationDuration: '1.5s' }}>
              🚀
            </div>
          </div>
          
          <div className="absolute top-32 right-1/4 animate-in fade-in slide-in-from-right-4 duration-700" style={{ animationDelay: '300ms' }}>
            <div className="text-5xl sm:text-6xl animate-bounce drop-shadow-lg" style={{ animationDuration: '1.7s' }}>
              ⭐
            </div>
          </div>
          
          <div className="absolute top-40 left-1/2 -translate-x-1/2 animate-in fade-in zoom-in-95 duration-700" style={{ animationDelay: '400ms' }}>
            <div className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent drop-shadow-lg">
              WE'RE LIVE!
            </div>
          </div>
          
          {/* Floating Celebration Emojis */}
          <div className="absolute top-1/4 left-10 animate-in fade-in duration-1000" style={{ animationDelay: '500ms' }}>
            <div className="text-4xl animate-spin" style={{ animationDuration: '3s' }}>🎊</div>
          </div>
          
          <div className="absolute top-1/3 right-10 animate-in fade-in duration-1000" style={{ animationDelay: '600ms' }}>
            <div className="text-4xl animate-spin" style={{ animationDuration: '4s', animationDirection: 'reverse' }}>✨</div>
          </div>
          
          <div className="absolute bottom-1/4 left-1/4 animate-in fade-in duration-1000" style={{ animationDelay: '700ms' }}>
            <div className="text-3xl animate-bounce" style={{ animationDuration: '2s' }}>🎈</div>
          </div>
          
          <div className="absolute bottom-1/3 right-1/4 animate-in fade-in duration-1000" style={{ animationDelay: '800ms' }}>
            <div className="text-3xl animate-bounce" style={{ animationDuration: '2.2s' }}>🎁</div>
          </div>
          
          {/* Celebration Text Elements */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-in fade-in zoom-in-95 duration-1000" style={{ animationDelay: '600ms' }}>
            <div className="text-center">
              <div className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 via-blue-600 to-indigo-600 mb-2 drop-shadow-lg">
                Congratulations!
              </div>
              <div className="text-xl sm:text-2xl text-gray-800 font-bold">
                Application Successfully Launched
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Huge Launch Alert Popup */}
      {showLaunchAlert && (
        <div 
          className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-300"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowLaunchAlert(false);
              sessionStorage.setItem(LAUNCH_ALERT_DISMISSED_KEY, "true");
            }
          }}
        >
          <div className="relative w-full max-w-4xl max-h-[90vh] sm:max-h-[85vh] overflow-y-auto rounded-2xl sm:rounded-3xl border-2 sm:border-4 border-emerald-400/80 bg-gradient-to-br from-white via-emerald-50/60 via-blue-50/60 to-indigo-50/60 shadow-2xl animate-in zoom-in-95 slide-in-from-bottom-4 duration-500 scrollbar-hide">
            {/* Animated Background Glow */}
            <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500 via-blue-500 via-indigo-600 to-purple-600 rounded-3xl blur-2xl opacity-40 animate-pulse"></div>
            
            {/* Close Button */}
            <button
              onClick={() => {
                setShowLaunchAlert(false);
                sessionStorage.setItem(LAUNCH_ALERT_DISMISSED_KEY, "true");
              }}
              className="absolute top-4 right-4 z-10 rounded-full bg-white/95 hover:bg-white p-2.5 shadow-xl transition-all hover:scale-110 hover:rotate-90 border border-gray-200"
              aria-label="Close"
            >
              <X className="h-5 w-5 sm:h-6 sm:w-6 text-gray-700" />
            </button>

            {/* Decorative Background Elements */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-400/25 rounded-full blur-3xl -mr-48 -mt-48 animate-pulse"></div>
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-400/25 rounded-full blur-3xl -ml-48 -mb-48 animate-pulse" style={{ animationDelay: '1s' }}></div>
            <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-indigo-400/20 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 animate-pulse" style={{ animationDelay: '0.5s' }}></div>

            <div className="relative p-4 sm:p-6 md:p-8 lg:p-12">
              {/* Header Icon with Animation */}
              <div className="flex justify-center mb-4 sm:mb-6 animate-in zoom-in-95 duration-700">
                <div className="relative">
                  <div className="absolute inset-0 bg-emerald-500 rounded-full blur-2xl opacity-70 animate-ping"></div>
                  <div className="absolute inset-0 bg-blue-500 rounded-full blur-xl opacity-50 animate-pulse"></div>
                  <div className="relative flex items-center justify-center w-20 h-20 sm:w-24 sm:h-24 md:w-32 md:h-32 rounded-full bg-gradient-to-br from-emerald-500 via-blue-600 to-indigo-600 shadow-2xl transform transition-transform hover:scale-110 duration-300">
                    <Rocket className="h-10 w-10 sm:h-12 sm:w-12 md:h-16 md:w-16 text-white animate-bounce" style={{ animationDuration: '2s' }} />
                  </div>
                  {/* Floating Stars */}
                  <Star className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 h-4 w-4 sm:h-6 sm:w-6 text-yellow-400 animate-spin" style={{ animationDuration: '3s' }} />
                  <Star className="absolute -bottom-1 -left-1 sm:-bottom-2 sm:-left-2 h-3 w-3 sm:h-5 sm:w-5 text-yellow-300 animate-spin" style={{ animationDuration: '4s', animationDirection: 'reverse' }} />
                </div>
              </div>

              {/* Main Title */}
              <div className="text-center mb-4 sm:mb-6 animate-in fade-in slide-in-from-bottom-4 duration-700" style={{ animationDelay: '200ms' }}>
                <div className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-gradient-to-r from-emerald-100 via-blue-100 to-indigo-100 text-emerald-700 text-xs sm:text-sm font-bold mb-3 sm:mb-4 shadow-lg border-2 border-emerald-200/60">
                  <Sparkles className="h-3 w-3 sm:h-4 sm:w-4 animate-spin text-emerald-600" style={{ animationDuration: '3s' }} />
                  <span className="text-[10px] sm:text-xs">APPLICATION SUCCESSFULLY LAUNCHED!</span>
                  <Sparkles className="h-3 w-3 sm:h-4 sm:w-4 animate-spin text-indigo-600" style={{ animationDuration: '3s', animationDirection: 'reverse' }} />
                </div>
                <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-extrabold text-gray-900 mb-2 sm:mb-3 px-2">
                  <span className="bg-gradient-to-r from-emerald-600 via-blue-600 to-indigo-600 bg-clip-text text-transparent">
                    We're Live!
                  </span>
                </h1>
                <p className="text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl text-gray-700 font-semibold px-2">
                  The application has been successfully launched
                </p>
              </div>

              {/* Thank You Message Card */}
              <div className="bg-gradient-to-br from-white via-emerald-50/40 to-blue-50/40 backdrop-blur-md rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 lg:p-10 mb-4 sm:mb-6 border-2 border-emerald-200/60 shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-700" style={{ animationDelay: '400ms' }}>
                <div className="space-y-3 sm:space-y-4 md:space-y-5 text-center">
                  <div className="flex items-center justify-center gap-1.5 sm:gap-2 mb-3 sm:mb-4 flex-wrap">
                    <Heart className="h-5 w-5 sm:h-6 sm:w-6 md:h-8 md:w-8 text-rose-500 animate-pulse flex-shrink-0" />
                    <p className="text-base sm:text-lg md:text-xl lg:text-2xl xl:text-3xl font-bold bg-gradient-to-r from-emerald-700 via-blue-700 to-indigo-700 bg-clip-text text-transparent px-1">
                      Thank You, Hemachandran Sir!
                    </p>
                    <Heart className="h-5 w-5 sm:h-6 sm:w-6 md:h-8 md:w-8 text-rose-500 animate-pulse flex-shrink-0" style={{ animationDelay: '0.5s' }} />
                  </div>
                  
                  <p className="text-sm sm:text-base md:text-lg lg:text-xl text-gray-800 leading-relaxed font-medium px-1">
                    We are deeply honored and grateful to <span className="font-bold text-blue-700">Dr. Hemachandran Ravikumar</span> for launching our application. 
                    Your support, guidance, and trust in our mission mean the world to us.
                  </p>
                  
                  <p className="text-xs sm:text-sm md:text-base lg:text-lg text-gray-700 leading-relaxed px-1">
                    As a distinguished Scientist and Research Leader, your commitment to excellence, innovation, 
                    and empowering the next generation continues to inspire us every day. Your belief in 
                    Brintelli Tech Academy and Brintelli LMS has been instrumental in bringing this platform to life.
                  </p>

                  <p className="text-sm sm:text-base md:text-lg lg:text-xl text-blue-700 font-bold mt-3 sm:mt-4 px-1">
                    Thank you for being such an incredible mentor and leader!
                  </p>
                </div>
              </div>

              {/* Status Badge */}
              <div className="flex justify-center mb-4 sm:mb-6 animate-in zoom-in-95 duration-700" style={{ animationDelay: '600ms' }}>
                <div className="inline-flex items-center gap-2 sm:gap-3 px-4 sm:px-6 py-2 sm:py-3 rounded-full bg-gradient-to-r from-emerald-600 via-blue-600 to-indigo-600 text-white shadow-xl border-2 border-white/30">
                  <div className="h-2 w-2 sm:h-3 sm:w-3 bg-white rounded-full animate-ping"></div>
                  <span className="text-xs sm:text-sm md:text-base font-bold whitespace-nowrap">APPLICATION IS NOW LIVE</span>
                  <div className="h-2 w-2 sm:h-3 sm:w-3 bg-white rounded-full animate-ping" style={{ animationDelay: '0.5s' }}></div>
                </div>
              </div>

              {/* Footer Message */}
              <div className="flex items-center justify-center gap-1.5 sm:gap-2 text-xs sm:text-sm md:text-base text-gray-700 mb-4 sm:mb-6 animate-in fade-in duration-700 font-medium px-2" style={{ animationDelay: '700ms' }}>
                <Heart className="h-3 w-3 sm:h-4 sm:w-4 md:h-5 md:w-5 text-rose-500 flex-shrink-0" />
                <span className="text-center">Thank you for being part of this journey</span>
                <Heart className="h-3 w-3 sm:h-4 sm:w-4 md:h-5 md:w-5 text-rose-500 flex-shrink-0" />
              </div>

              {/* Action Button */}
              <div className="flex justify-center animate-in fade-in duration-700" style={{ animationDelay: '800ms' }}>
                <Button
                  onClick={() => {
                    setShowLaunchAlert(false);
                    sessionStorage.setItem(LAUNCH_ALERT_DISMISSED_KEY, "true");
                  }}
                  className="w-full sm:w-auto bg-gradient-to-r from-emerald-600 via-blue-600 to-indigo-600 hover:from-emerald-700 hover:via-blue-700 hover:to-indigo-700 text-white px-6 sm:px-8 md:px-12 py-2.5 sm:py-3 md:py-4 rounded-xl font-bold text-sm sm:text-base md:text-lg shadow-xl hover:shadow-2xl transition-all transform hover:scale-110 active:scale-95"
                >
                  Continue to Login
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
      <div className="flex w-full">
        {/* Left Side - Form */}
        <div className="flex w-full flex-col lg:w-1/2">
          <div className="flex min-h-screen flex-col items-center justify-center px-6 py-12 lg:px-12">
            <div className="w-full max-w-md">
              {/* Logo */}
              <div className="mb-8 flex items-center justify-center">
                <img 
                  src="/logo.png" 
                  alt="Brintelli Logo" 
                  className="h-20 w-auto object-contain"
                />
              </div>

              {/* Form Card */}
              <div className="rounded-2xl border border-brintelli-border bg-white p-8 shadow-xl">
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-text">Welcome Back!</h2>
                  <p className="mt-2 text-sm text-textMuted">Sign in to continue your learning journey</p>
                </div>
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="space-y-2">
                    <label htmlFor="email" className="text-sm font-semibold text-text">
                      Email address
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-textMuted" />
                      <input
                        id="email"
                        name="email"
                        type="email"
                        required
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="you@brintelli.com"
                        className="w-full rounded-xl border border-brintelli-border px-4 py-3 pl-11 text-sm text-textSoft outline-none transition duration-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 hover:border-brand-400"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label htmlFor="password" className="text-sm font-semibold text-text">
                        Password
                      </label>
                      <Link
                        to="/auth/forgot-password"
                        className="text-xs font-medium text-brand-500 hover:text-brand-600 transition-colors"
                      >
                        Forgot password?
                      </Link>
                    </div>
                    <PasswordInput
                      id="password"
                      name="password"
                      required
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="Enter your password"
                    />
                  </div>
                  <Button type="submit" className="w-full mt-6" disabled={isLoading}>
                    {isLoading ? "Signing in..." : "Sign In"}
                  </Button>
                </form>
              </div>

              <div className="mt-6 text-center text-textMuted text-xs">
                <span>© {new Date().getFullYear()} Brintelli Academy</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Image Carousel */}
        <div className="hidden lg:flex lg:w-1/2 h-screen" style={{ margin: 0, padding: 0 }}>
          <AuthImageCarousel />
        </div>
      </div>
    </div>
  );
};

export default SignIn;


