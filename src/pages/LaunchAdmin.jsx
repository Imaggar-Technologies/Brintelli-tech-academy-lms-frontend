import { useEffect, useRef, useState } from "react";
import { API_BASE_URL } from "../api/constant";
import { getLaunchStatus, launchApp, revokeLaunch } from "../api/launch";
import { confettiBurst, confettiLong } from "../utils/confetti";
import { Rocket, RefreshCw, CheckCircle2, XCircle, Clock, ExternalLink, Sparkles, X, Heart, Star } from "lucide-react";
import Button from "../components/Button";

const LaunchAdmin = () => {
  const [status, setStatus] = useState({ isLaunched: false, launchedAt: null });
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [showThankYouModal, setShowThankYouModal] = useState(false);
  const prevLaunchedRef = useRef(false);
  const hasShownModalRef = useRef(false);

  const refresh = async () => {
    setError("");
    setLoading(true);
    try {
      const data = await getLaunchStatus();
      setStatus(data);
      const becameLaunched = !prevLaunchedRef.current && !!data?.isLaunched;
      prevLaunchedRef.current = !!data?.isLaunched;
      if (becameLaunched) {
        confettiBurst();
        // Trigger multiple confetti bursts for celebration
        setTimeout(() => confettiBurst(), 300);
        setTimeout(() => confettiBurst(), 600);
        confettiLong(3000);
        setShowThankYouModal(true);
        hasShownModalRef.current = true;
      }
      // Also show modal if app is already launched when page loads (first time only)
      if (data?.isLaunched && !hasShownModalRef.current && prevLaunchedRef.current === false) {
        confettiBurst();
        confettiLong(2000);
        setShowThankYouModal(true);
        hasShownModalRef.current = true;
      }
    } catch (e) {
      setError(e?.message || "Failed to load status");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();
  }, []);

  const onLaunch = async () => {
    setBusy(true);
    setError("");
    try {
      await launchApp();
      await refresh();
      // Celebrate with confetti
      confettiBurst();
      setTimeout(() => confettiBurst(), 300);
      setTimeout(() => confettiBurst(), 600);
      confettiLong(3000);
      setShowThankYouModal(true);
    } catch (e) {
      setError(e?.message || "Launch failed");
    } finally {
      setBusy(false);
    }
  };

  const onRevoke = async () => {
    setBusy(true);
    setError("");
    try {
      await revokeLaunch();
      await refresh();
    } catch (e) {
      setError(e?.message || "Revoke failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Hero Section with Thank You Note */}
      <div className="relative overflow-hidden bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-full h-full opacity-20">
            <div className="absolute top-10 left-10 w-72 h-72 bg-white rounded-full blur-3xl"></div>
            <div className="absolute bottom-10 right-10 w-96 h-96 bg-white rounded-full blur-3xl"></div>
          </div>
        </div>
        
        <div className="relative mx-auto max-w-6xl px-4 py-8 sm:py-12 md:py-16 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center text-center">
            {/* Thank You Note */}
            <div className="mb-4 sm:mb-8 inline-flex items-center gap-2 rounded-full bg-white/20 backdrop-blur-sm px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-medium text-white">
              <Sparkles className="h-3 w-3 sm:h-4 sm:w-4" />
              <span>Special Recognition</span>
            </div>
            
            <h1 className="mb-4 sm:mb-6 text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-white px-2">
              Thank You, Hemachandran Sir
            </h1>
            
            <div className="max-w-3xl space-y-3 sm:space-y-4 text-sm sm:text-base md:text-lg lg:text-xl text-white/90 px-2">
              <p className="leading-relaxed">
                We are deeply grateful for your unwavering support, guidance, and dedication. 
                Your leadership and vision have been instrumental in shaping this platform and 
                inspiring excellence in everything we do.
              </p>
              <p className="leading-relaxed">
                Your commitment to innovation and your belief in our mission have made all the 
                difference. Thank you for being such an incredible mentor and leader.
              </p>
            </div>
            
            {/* Full Tribute Section */}
            <div className="mt-8 sm:mt-12 max-w-4xl w-full px-4">
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 sm:p-8 border border-white/20 shadow-xl">
                <div className="space-y-4 sm:space-y-5 text-white/95 text-sm sm:text-base md:text-lg leading-relaxed">
                  <p>
                    We are deeply honored to have <span className="font-bold text-white">Dr. Hemachandran Ravikumar</span> as a Mentor, Guide, and Visionary Supporter of Brintelli Tech Academy and Brintelli LMS.
                  </p>
                  
                  <p>
                    Dr. Hemachandran Ravikumar is a distinguished Scientist and Research Leader, whose journey, discipline, and commitment to knowledge continue to inspire educators, researchers, and learners across the globe. His guidance goes beyond academics — shaping values, mindset, and purpose-driven learning.
                  </p>

                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 sm:p-5 border border-white/20 mt-4">
                    <h4 className="font-semibold text-white mb-3 text-base sm:text-lg">As a mentor, he provides us with:</h4>
                    <ul className="space-y-2 sm:space-y-3 text-sm sm:text-base">
                      <li className="flex items-start gap-2 sm:gap-3">
                        <div className="flex-shrink-0 w-2 h-2 rounded-full bg-white mt-2"></div>
                        <span>Strategic guidance and clarity of vision</span>
                      </li>
                      <li className="flex items-start gap-2 sm:gap-3">
                        <div className="flex-shrink-0 w-2 h-2 rounded-full bg-white mt-2"></div>
                        <span>Strong emphasis on research, innovation, and real-world impact</span>
                      </li>
                      <li className="flex items-start gap-2 sm:gap-3">
                        <div className="flex-shrink-0 w-2 h-2 rounded-full bg-white mt-2"></div>
                        <span>Motivation to build platforms that truly empower learners</span>
                      </li>
                    </ul>
                  </div>

                  <p className="mt-4">
                    His encouragement and trust have been a driving force in the launch and growth of Brintelli LMS, helping us align technology with meaningful education.
                  </p>

                  <p className="font-semibold text-white mt-4">
                    We are proud to be guided by a mentor whose life and work reflect excellence, integrity, and a passion for empowering the next generation.
                  </p>
                </div>
              </div>
            </div>

            {/* Decorative Elements */}
            <div className="mt-6 sm:mt-8 flex items-center gap-2 text-white/60">
              <div className="h-px w-8 sm:w-16 bg-white/30"></div>
              <Rocket className="h-4 w-4 sm:h-5 sm:w-5" />
              <div className="h-px w-8 sm:w-16 bg-white/30"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Launch Control Section */}
      <div className="mx-auto max-w-5xl px-4 py-6 sm:py-8 md:py-12 sm:px-6 lg:px-8">
        <div className="rounded-2xl sm:rounded-3xl border border-white/20 bg-white/80 backdrop-blur-xl shadow-2xl p-4 sm:p-6 md:p-8 lg:p-10">
          {/* Header */}
          <div className="mb-6 sm:mb-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-2">
              <div className="rounded-lg sm:rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 p-1.5 sm:p-2 flex-shrink-0">
                <Rocket className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Launch Control Center</h2>
                <p className="text-xs sm:text-sm text-gray-600">Manage global application launch state</p>
              </div>
            </div>
          </div>

          {/* Status Card */}
          <div className="mb-4 sm:mb-6 rounded-xl sm:rounded-2xl border-2 border-gray-200 bg-gradient-to-br from-gray-50 to-white p-4 sm:p-6 shadow-lg">
            <div className="flex flex-col gap-4 sm:gap-6 sm:flex-row sm:items-center sm:justify-between">
              <div className="space-y-2 sm:space-y-3 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs sm:text-sm font-medium text-gray-600">Current Status</span>
                  {loading ? (
                    <div className="h-2 w-2 animate-pulse rounded-full bg-gray-400"></div>
                  ) : status.isLaunched ? (
                    <CheckCircle2 className="h-3 w-3 sm:h-4 sm:w-4 text-emerald-500" />
                  ) : (
                    <XCircle className="h-3 w-3 sm:h-4 sm:w-4 text-gray-400" />
                  )}
                </div>
                
                <div className="flex items-center gap-2 sm:gap-3">
                  {loading ? (
                    <div className="h-7 sm:h-8 w-24 sm:w-32 animate-pulse rounded-lg bg-gray-200"></div>
                  ) : (
                    <>
                      <div
                        className={`inline-flex items-center gap-1.5 sm:gap-2 rounded-full px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-bold ${
                          status.isLaunched
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {status.isLaunched ? (
                          <>
                            <CheckCircle2 className="h-3 w-3 sm:h-4 sm:w-4" />
                            <span className="whitespace-nowrap">LAUNCHED</span>
                          </>
                        ) : (
                          <>
                            <XCircle className="h-3 w-3 sm:h-4 sm:w-4" />
                            <span className="whitespace-nowrap">NOT LAUNCHED</span>
                          </>
                        )}
                      </div>
                    </>
                  )}
                </div>

                {status.launchedAt && (
                  <div className="flex items-start sm:items-center gap-2 text-xs sm:text-sm text-gray-600">
                    <Clock className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0 mt-0.5 sm:mt-0" />
                    <span className="break-words">
                      Launched at: {new Date(status.launchedAt).toLocaleString()}
                    </span>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 w-full sm:w-auto">
                <button
                  className="flex items-center justify-center gap-2 rounded-xl border-2 border-gray-300 bg-white px-4 sm:px-5 py-2.5 sm:py-3 text-xs sm:text-sm font-semibold text-gray-700 transition-all hover:border-gray-400 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={refresh}
                  disabled={loading || busy}
                  type="button"
                >
                  <RefreshCw className={`h-3 w-3 sm:h-4 sm:w-4 ${loading ? "animate-spin" : ""}`} />
                  Refresh
                </button>

                <button
                  className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 px-4 sm:px-5 py-2.5 sm:py-3 text-xs sm:text-sm font-semibold text-white shadow-lg transition-all hover:from-emerald-600 hover:to-emerald-700 hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={onLaunch}
                  disabled={busy || loading || status.isLaunched}
                  type="button"
                >
                  <Rocket className="h-3 w-3 sm:h-4 sm:w-4" />
                  Launch App
                </button>

                <button
                  className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-rose-500 to-rose-600 px-4 sm:px-5 py-2.5 sm:py-3 text-xs sm:text-sm font-semibold text-white shadow-lg transition-all hover:from-rose-600 hover:to-rose-700 hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={onRevoke}
                  disabled={busy || loading || !status.isLaunched}
                  type="button"
                >
                  <XCircle className="h-3 w-3 sm:h-4 sm:w-4" />
                  Revoke Launch
                </button>
              </div>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 sm:mb-6 rounded-lg sm:rounded-xl border-2 border-rose-200 bg-rose-50 px-3 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm text-rose-700 shadow-sm">
              <div className="flex items-start gap-2">
                <XCircle className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0 mt-0.5" />
                <span className="break-words">{error}</span>
              </div>
            </div>
          )}

          {/* Public Status Link */}
          <div className="rounded-lg sm:rounded-xl border border-gray-200 bg-gray-50 p-3 sm:p-4">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4">
              <div className="flex-1 min-w-0">
                <p className="text-xs sm:text-sm font-medium text-gray-700">Public Status Endpoint</p>
                <p className="text-xs text-gray-500 mt-1">Access the public launch status API</p>
              </div>
              <a
                className="flex items-center justify-center gap-2 rounded-lg bg-white px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium text-indigo-600 transition-all hover:bg-indigo-50 hover:text-indigo-700 border border-gray-200 whitespace-nowrap"
                href={`${API_BASE_URL}/launch`}
                target="_blank"
                rel="noreferrer"
              >
                <span>View Status</span>
                <ExternalLink className="h-3 w-3 sm:h-4 sm:w-4" />
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Thank You Modal for Launching */}
      {showThankYouModal && (
        <div 
          className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-300"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowThankYouModal(false);
            }
          }}
        >
          <div className="relative w-full max-w-4xl max-h-[90vh] sm:max-h-[85vh] overflow-y-auto rounded-2xl sm:rounded-3xl border-2 sm:border-4 border-blue-400/80 bg-gradient-to-br from-white via-blue-50/60 via-indigo-50/60 to-purple-50/60 shadow-2xl animate-in zoom-in-95 slide-in-from-bottom-4 duration-500 scrollbar-hide">
            {/* Animated Background Glow */}
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 via-indigo-600 via-purple-600 to-pink-500 rounded-3xl blur-2xl opacity-40 animate-pulse"></div>
            
            {/* Close Button */}
            <button
              onClick={() => setShowThankYouModal(false)}
              className="absolute top-4 right-4 z-10 rounded-full bg-white/95 hover:bg-white p-2.5 shadow-xl transition-all hover:scale-110 hover:rotate-90 border border-gray-200"
              aria-label="Close"
            >
              <X className="h-5 w-5 sm:h-6 sm:w-6 text-gray-700" />
            </button>

            {/* Decorative Background Elements */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-blue-400/25 rounded-full blur-3xl -mr-48 -mt-48 animate-pulse"></div>
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-400/25 rounded-full blur-3xl -ml-48 -mb-48 animate-pulse" style={{ animationDelay: '1s' }}></div>
            <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-indigo-400/20 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 animate-pulse" style={{ animationDelay: '0.5s' }}></div>

            <div className="relative p-4 sm:p-6 md:p-8 lg:p-12">
              {/* Header Icon with Animation */}
              <div className="flex justify-center mb-4 sm:mb-6 animate-in zoom-in-95 duration-700">
                <div className="relative">
                  <div className="absolute inset-0 bg-blue-500 rounded-full blur-2xl opacity-70 animate-ping"></div>
                  <div className="absolute inset-0 bg-indigo-500 rounded-full blur-xl opacity-50 animate-pulse"></div>
                  <div className="relative flex items-center justify-center w-20 h-20 sm:w-24 sm:h-24 md:w-32 md:h-32 rounded-full bg-gradient-to-br from-blue-500 via-indigo-600 to-purple-600 shadow-2xl transform transition-transform hover:scale-110 duration-300">
                    <Rocket className="h-10 w-10 sm:h-12 sm:w-12 md:h-16 md:w-16 text-white animate-bounce" style={{ animationDuration: '2s' }} />
                  </div>
                  {/* Floating Stars */}
                  <Star className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 h-4 w-4 sm:h-6 sm:w-6 text-yellow-400 animate-spin" style={{ animationDuration: '3s' }} />
                  <Star className="absolute -bottom-1 -left-1 sm:-bottom-2 sm:-left-2 h-3 w-3 sm:h-5 sm:w-5 text-yellow-300 animate-spin" style={{ animationDuration: '4s', animationDirection: 'reverse' }} />
                </div>
              </div>

              {/* Main Title */}
              <div className="text-center mb-4 sm:mb-6 animate-in fade-in slide-in-from-bottom-4 duration-700" style={{ animationDelay: '200ms' }}>
                <div className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-gradient-to-r from-blue-100 via-indigo-100 to-purple-100 text-blue-700 text-xs sm:text-sm font-bold mb-3 sm:mb-4 shadow-lg border-2 border-blue-200/60">
                  <Sparkles className="h-3 w-3 sm:h-4 sm:w-4 animate-spin text-blue-600" style={{ animationDuration: '3s' }} />
                  <span className="text-[10px] sm:text-xs">THANK YOU FOR LAUNCHING OUR APPLICATION!</span>
                  <Sparkles className="h-3 w-3 sm:h-4 sm:w-4 animate-spin text-purple-600" style={{ animationDuration: '3s', animationDirection: 'reverse' }} />
                </div>
                <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-extrabold text-gray-900 mb-2 sm:mb-3 px-2">
                  <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
                    Thank You, Hemachandran Sir!
                  </span>
                </h1>
                <p className="text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl text-gray-700 font-semibold px-2">
                  We are deeply grateful for launching our application
                </p>
              </div>

              {/* Thank You Message Card */}
              <div className="bg-gradient-to-br from-white via-blue-50/40 to-indigo-50/40 backdrop-blur-md rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 lg:p-10 mb-4 sm:mb-6 border-2 border-blue-200/60 shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-700" style={{ animationDelay: '400ms' }}>
                <div className="space-y-3 sm:space-y-4 md:space-y-5 text-center">
                  <div className="flex items-center justify-center gap-1.5 sm:gap-2 mb-3 sm:mb-4 flex-wrap">
                    <Heart className="h-5 w-5 sm:h-6 sm:w-6 md:h-8 md:w-8 text-rose-500 animate-pulse flex-shrink-0" />
                    <p className="text-base sm:text-lg md:text-xl lg:text-2xl xl:text-3xl font-bold bg-gradient-to-r from-blue-700 via-indigo-700 to-purple-700 bg-clip-text text-transparent px-1">
                      Thank You for Launching Our Application
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
                <div className="inline-flex items-center gap-2 sm:gap-3 px-4 sm:px-6 py-2 sm:py-3 rounded-full bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white shadow-xl border-2 border-white/30">
                  <div className="h-2 w-2 sm:h-3 sm:w-3 bg-white rounded-full animate-ping"></div>
                  <span className="text-xs sm:text-sm md:text-base font-bold whitespace-nowrap">APPLICATION SUCCESSFULLY LAUNCHED</span>
                  <div className="h-2 w-2 sm:h-3 sm:w-3 bg-white rounded-full animate-ping" style={{ animationDelay: '0.5s' }}></div>
                </div>
              </div>

              {/* Footer Message */}
              <div className="flex items-center justify-center gap-1.5 sm:gap-2 text-xs sm:text-sm md:text-base text-gray-700 mb-4 sm:mb-6 font-medium px-2">
                <Heart className="h-3 w-3 sm:h-4 sm:w-4 md:h-5 md:w-5 text-rose-500 flex-shrink-0" />
                <span className="text-center">With deepest gratitude and respect</span>
                <Heart className="h-3 w-3 sm:h-4 sm:w-4 md:h-5 md:w-5 text-rose-500 flex-shrink-0" />
              </div>

              {/* Action Button */}
              <div className="flex justify-center animate-in fade-in duration-700" style={{ animationDelay: '800ms' }}>
                <Button
                  onClick={() => setShowThankYouModal(false)}
                  className="w-full sm:w-auto bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:via-indigo-700 hover:to-purple-700 text-white px-6 sm:px-8 md:px-12 py-2.5 sm:py-3 md:py-4 rounded-xl font-bold text-sm sm:text-base md:text-lg shadow-xl hover:shadow-2xl transition-all transform hover:scale-110 active:scale-95"
                >
                  Close
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LaunchAdmin;


