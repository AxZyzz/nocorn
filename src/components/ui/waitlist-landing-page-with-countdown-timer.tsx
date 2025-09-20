"use client"

import React from "react"

import {
  Scene,
  PerspectiveCamera,
  WebGLRenderer,
  QuadraticBezierCurve3,
  Vector3,
  TubeGeometry,
  ShaderMaterial,
  Mesh,
  AdditiveBlending,
  DoubleSide,
} from "three"
import type { ReactElement } from "react"
import { useState, useEffect, useRef } from "react"
import { addToWaitlist, checkEmailExists, supabase } from "@/lib/supabase"

const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={`flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
        ref={ref}
        {...props}
      />
    )
  },
)
Input.displayName = "Input"

const Button = React.forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement>>(
  ({ className, children, ...props }, ref) => {
    return (
      <button
        className={`inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 ${className}`}
        ref={ref}
        {...props}
      >
        {children}
      </button>
    )
  },
)
Button.displayName = "Button"

export function WaitlistExperience(): ReactElement {
  const mountRef = useRef<HTMLDivElement>(null)
  const sceneRef = useRef<Scene>()
  const rendererRef = useRef<WebGLRenderer>()
  const animationIdRef = useRef<number>()

  const [email, setEmail] = useState("")
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [waitlistCount, setWaitlistCount] = useState(72) // Start from 72
  const [timeElapsed, setTimeElapsed] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  })
  
  // Fixed start date for NO-CORN launch preparation (set this to your actual launch prep start date)
  const startTimeRef = useRef<Date>(new Date('2025-09-20T07:30:00+05:30')) // Today at 7:30 AM IST when you started

  // Three.js background effect
  useEffect(() => {
    if (!mountRef.current) return

    // Scene setup
    const scene = new Scene()
    sceneRef.current = scene

    const camera = new PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)

    const renderer = new WebGLRenderer({
      antialias: true,
      alpha: true,
    })
    rendererRef.current = renderer

    renderer.setSize(window.innerWidth, window.innerHeight)
    renderer.setClearColor(0x000000, 1)
    mountRef.current.appendChild(renderer.domElement)

    // Create curved light geometry
    const curve = new QuadraticBezierCurve3(new Vector3(-15, -4, 0), new Vector3(2, 3, 0), new Vector3(18, 0.8, 0))

    // Create tube geometry for the light streak
    const tubeGeometry = new TubeGeometry(curve, 200, 0.8, 32, false)

    // Create gradient material
    const vertexShader = `
      varying vec2 vUv;
      varying vec3 vPosition;
      
      void main() {
        vUv = uv;
        vPosition = position;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `

    const fragmentShader = `
      uniform float time;
      varying vec2 vUv;
      varying vec3 vPosition;
      
      void main() {
        // Create the gradient from red/orange to purple/magenta
        vec3 color1 = vec3(1.0, 0.2, 0.1); // Red/Orange
        vec3 color2 = vec3(0.8, 0.1, 0.6); // Purple/Magenta
        vec3 color3 = vec3(0.4, 0.05, 0.8); // Deep purple
        
        // Mix colors based on UV coordinates
        vec3 finalColor = mix(color1, color2, vUv.x);
        finalColor = mix(finalColor, color3, vUv.x * 0.7);
        
        // Add glow effect
        float glow = 1.0 - abs(vUv.y - 0.5) * 2.0;
        glow = pow(glow, 2.0);
        
        float fade = 1.0;
        if (vUv.x > 0.85) {
          fade = 1.0 - smoothstep(0.85, 1.0, vUv.x);
        }
        
        // Add subtle animation
        float pulse = sin(time * 2.0) * 0.1 + 0.9;
        
        gl_FragColor = vec4(finalColor * glow * pulse * fade, glow * fade * 0.8);
      }
    `

    const material = new ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms: {
        time: { value: 0 },
      },
      transparent: true,
      blending: AdditiveBlending,
      side: DoubleSide,
    })

    const lightStreak = new Mesh(tubeGeometry, material)
    scene.add(lightStreak)

    // Add additional glow layers for more realistic effect
    const glowGeometry = new TubeGeometry(curve, 200, 1.5, 32, false)
    const glowMaterial = new ShaderMaterial({
      vertexShader,
      fragmentShader: `
        uniform float time;
        varying vec2 vUv;
        varying vec3 vPosition;
        
        void main() {
          vec3 color1 = vec3(1.0, 0.3, 0.2);
          vec3 color2 = vec3(0.6, 0.2, 0.8);
          
          vec3 finalColor = mix(color1, color2, vUv.x);
          
          float glow = 1.0 - abs(vUv.y - 0.5) * 2.0;
          glow = pow(glow, 4.0);
          
          float fade = 1.0;
          if (vUv.x > 0.85) {
            fade = 1.0 - smoothstep(0.85, 1.0, vUv.x);
          }
          
          float pulse = sin(time * 1.5) * 0.05 + 0.95;
          
          gl_FragColor = vec4(finalColor * glow * pulse * fade, glow * fade * 0.3);
        }
      `,
      uniforms: {
        time: { value: 0 },
      },
      transparent: true,
      blending: AdditiveBlending,
      side: DoubleSide,
    })

    const glowLayer = new Mesh(glowGeometry, glowMaterial)
    scene.add(glowLayer)

    // Position camera
    camera.position.z = 7
    camera.position.y = -0.8

    // Animation loop
    const animate = () => {
      animationIdRef.current = requestAnimationFrame(animate)

      const time = Date.now() * 0.001
      material.uniforms.time.value = time
      glowMaterial.uniforms.time.value = time

      // Subtle rotation for dynamic effect
      lightStreak.rotation.z = Math.sin(time * 0.2) * 0.05
      glowLayer.rotation.z = Math.sin(time * 0.2) * 0.05

      renderer.render(scene, camera)
    }

    animate()

    // Handle resize
    const handleResize = () => {
      if (!camera || !renderer) return

      camera.aspect = window.innerWidth / window.innerHeight
      camera.updateProjectionMatrix()
      renderer.setSize(window.innerWidth, window.innerHeight)
    }

    window.addEventListener("resize", handleResize)

    // Cleanup
    return () => {
      window.removeEventListener("resize", handleResize)

      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current)
      }

      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement)
      }

      renderer.dispose()
      tubeGeometry.dispose()
      glowGeometry.dispose()
      material.dispose()
      glowMaterial.dispose()
    }
  }, [])

  // Fetch initial waitlist count
  useEffect(() => {
    const fetchWaitlistCount = async () => {
      try {
        // Check if Supabase is properly configured
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
        if (!supabaseUrl || supabaseUrl === 'https://placeholder.supabase.co') {
          console.log('Supabase not configured, using default count')
          return
        }

        const { count, error } = await supabase
          .from('waitlist')
          .select('*', { count: 'exact', head: true })

        if (error) throw error
        
        // Add 71 to the actual count to start from 72
        setWaitlistCount((count || 0) + 71)
      } catch (error) {
        console.error('Error fetching waitlist count:', error)
        // Keep default of 72 if there's an error
      }
    }

    fetchWaitlistCount()
  }, [])

  // Count-up timer from current moment
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date()
      const startTime = startTimeRef.current
      const diffInSeconds = Math.floor((now.getTime() - startTime.getTime()) / 1000)

      const days = Math.floor(diffInSeconds / (24 * 60 * 60))
      const hours = Math.floor((diffInSeconds % (24 * 60 * 60)) / (60 * 60))
      const minutes = Math.floor((diffInSeconds % (60 * 60)) / 60)
      const seconds = diffInSeconds % 60

      setTimeElapsed({ days, hours, minutes, seconds })
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return

    setIsLoading(true)
    setError(null)

    try {
      // Check if email already exists
      const emailExists = await checkEmailExists(email)
      if (emailExists) {
        setError("You're already registered! Check your email for updates.")
        setIsLoading(false)
        return
      }

      // Add email to waitlist
      await addToWaitlist(email)
      setIsSubmitted(true)
      
      // Increment the waitlist count
      setWaitlistCount(prev => prev + 1)
      
      console.log("Email submitted to waitlist:", email)
    } catch (err: any) {
      console.error("Error adding to waitlist:", err)
      setError(err.message || "Something went wrong. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const features = ["NO-CORN"]

  return (
    <main className="relative min-h-screen overflow-hidden bg-black w-full">
      {/* Three.js Background */}
      <div ref={mountRef} className="fixed inset-0 w-full h-full" style={{ zIndex: 0 }} />

      {/* Content Layer */}
      <div className="relative z-10 min-h-screen">
        {/* Top Navigation */}
        <div className="absolute top-8 left-1/2 transform -translate-x-1/2 z-20">
          <div className="bg-black/40 backdrop-blur-md border border-white/10 rounded-full px-6 py-3">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-4">
                {features.map((feature, index) => (
                  <button
                    key={feature}
                    className="text-sm px-3 py-1 rounded-full transition-colors bg-black/60 text-white border border-white/20"
                  >
                    {feature}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Waitlist Card */}
        <div className="flex items-center justify-center min-h-screen px-4">
          <div className="relative">
            <div className="relative backdrop-blur-xl bg-black/60 border border-white/20 rounded-3xl p-8 w-[420px] shadow-2xl">
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />

              <div className="relative z-10">
                {!isSubmitted ? (
                  <>
                    <div className="mb-8 text-center">
                      <h1 className="text-4xl font-light text-white mb-4 tracking-wide">Join the waitlist</h1>
                      <p className="text-white/70 text-base leading-relaxed">
                        Get early access to NO-CORN - your gamified
                        <br />
                        porn blocker and wellness tracker, launching soon
                      </p>
                    </div>

                    <form onSubmit={handleSubmit} className="mb-6">
                      <div className="flex gap-3">
                        <Input
                          type="email"
                          placeholder="your@email.com"
                          value={email}
                          onChange={(e) => {
                            setEmail(e.target.value)
                            setError(null) // Clear error when user types
                          }}
                          required
                          disabled={isLoading}
                          className="flex-1 bg-black/40 border-white/20 text-white placeholder:text-white/50 focus:border-white/40 focus:ring-white/20 h-12 rounded-xl backdrop-blur-sm disabled:opacity-50"
                        />
                        <Button
                          type="submit"
                          disabled={isLoading || !email}
                          className="h-12 px-6 bg-red-600 hover:bg-red-700 text-white font-medium rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-red-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isLoading ? "Joining..." : "Join Waitlist"}
                        </Button>
                      </div>
                      {error && (
                        <p className="text-red-400 text-sm mt-2 text-center">{error}</p>
                      )}
                    </form>

                    <div className="flex items-center justify-center gap-3 mb-6">
                      <div className="flex -space-x-2">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 border-2 border-white/20 flex items-center justify-center text-white text-xs font-semibold">
                          AK
                        </div>
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-400 to-green-600 border-2 border-white/20 flex items-center justify-center text-white text-xs font-semibold">
                          MJ
                        </div>
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 border-2 border-white/20 flex items-center justify-center text-white text-xs font-semibold">
                          SL
                        </div>
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 border-2 border-white/20 flex items-center justify-center text-white text-xs font-semibold">
                          RK
                        </div>
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-pink-400 to-pink-600 border-2 border-white/20 flex items-center justify-center text-white text-xs font-semibold">
                          +{waitlistCount - 4}
                        </div>
                      </div>
                      <span className="text-white/70 text-sm">{waitlistCount}+ people already joined</span>
                    </div>

                    {/* Discord Button */}
                    <div className="flex justify-center mb-6">
                      <button
                        onClick={() => window.open('https://discord.gg/uUpeXN3A2j', '_blank')}
                        className="flex items-center gap-2 px-4 py-2 bg-[#5865F2]/20 hover:bg-[#5865F2]/30 border border-[#5865F2]/40 hover:border-[#5865F2]/60 rounded-xl text-white/90 hover:text-white text-sm font-medium transition-all duration-300 backdrop-blur-sm hover:shadow-lg hover:shadow-[#5865F2]/20"
                      >
                        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515a.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0a12.64 12.64 0 0 0-.617-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057a19.9 19.9 0 0 0 5.993 3.03a.078.078 0 0 0 .084-.028a14.09 14.09 0 0 0 1.226-1.994a.076.076 0 0 0-.041-.106a13.107 13.107 0 0 1-1.872-.892a.077.077 0 0 1-.008-.128a10.2 10.2 0 0 0 .372-.292a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.197.373.292a.077.077 0 0 1-.006.127a12.299 12.299 0 0 1-1.873.892a.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028a19.839 19.839 0 0 0 6.002-3.03a.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.956-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.955-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.946 2.418-2.157 2.418z"/>
                        </svg>
                        Join Discord Community
                      </button>
                    </div>

                    <div className="text-center mb-6">
                      <p className="text-white/60 text-sm mb-2">Time since launch preparation started</p>
                    </div>

                    <div className="flex items-center justify-center gap-6 text-center">
                      <div>
                        <div className="text-2xl font-light text-white">{timeElapsed.days}</div>
                        <div className="text-xs text-white/60 uppercase tracking-wide">days</div>
                      </div>
                      <div className="text-white/40">|</div>
                      <div>
                        <div className="text-2xl font-light text-white">{timeElapsed.hours}</div>
                        <div className="text-xs text-white/60 uppercase tracking-wide">hours</div>
                      </div>
                      <div className="text-white/40">|</div>
                      <div>
                        <div className="text-2xl font-light text-white">{timeElapsed.minutes}</div>
                        <div className="text-xs text-white/60 uppercase tracking-wide">minutes</div>
                      </div>
                      <div className="text-white/40">|</div>
                      <div>
                        <div className="text-2xl font-light text-white">{timeElapsed.seconds}</div>
                        <div className="text-xs text-white/60 uppercase tracking-wide">seconds</div>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-4">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-green-400/30 to-emerald-500/30 flex items-center justify-center border border-green-400/40">
                      <svg
                        className="w-8 h-8 text-green-400 drop-shadow-lg"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-semibold text-white mb-2 drop-shadow-lg">Welcome to NO-CORN! 🎉</h3>
                    <p className="text-white/90 text-sm drop-shadow-md mb-4">
                      You&apos;re on the waitlist! We&apos;ll notify you when we launch.
                    </p>
                    
                    {/* Discord Button in Success State */}
                    <button
                      onClick={() => window.open('https://discord.gg/uUpeXN3A2j', '_blank')}
                      className="flex items-center gap-2 mx-auto px-4 py-2 bg-[#5865F2]/20 hover:bg-[#5865F2]/30 border border-[#5865F2]/40 hover:border-[#5865F2]/60 rounded-xl text-white/90 hover:text-white text-sm font-medium transition-all duration-300 backdrop-blur-sm hover:shadow-lg hover:shadow-[#5865F2]/20"
                    >
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515a.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0a12.64 12.64 0 0 0-.617-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057a19.9 19.9 0 0 0 5.993 3.03a.078.078 0 0 0 .084-.028a14.09 14.09 0 0 0 1.226-1.994a.076.076 0 0 0-.041-.106a13.107 13.107 0 0 1-1.872-.892a.077.077 0 0 1-.008-.128a10.2 10.2 0 0 0 .372-.292a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.197.373.292a.077.077 0 0 1-.006.127a12.299 12.299 0 0 1-1.873.892a.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028a19.839 19.839 0 0 0 6.002-3.03a.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.956-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.955-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.946 2.418-2.157 2.418z"/>
                      </svg>
                      Join our Discord
                    </button>
                  </div>
                )}
              </div>

              <div className="absolute inset-0 rounded-3xl bg-gradient-to-t from-transparent via-white/[0.02] to-white/[0.05] pointer-events-none" />
            </div>

            <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-red-500/10 to-purple-600/10 blur-xl scale-110 -z-10" />
          </div>
        </div>
      </div>
    </main>
  )
}
