'use client';

import { BackgroundRenderer } from '../focus/BackgroundRenderer';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { SignUp } from '@clerk/nextjs';
import { dark } from '@clerk/themes';

export function SignUpScreen() {
    return (
        <main className="relative flex min-h-screen w-full items-center justify-center overflow-auto text-text-primary px-4 py-12">
            <BackgroundRenderer />

            <div className="z-10 w-full max-w-lg flex flex-col items-center gap-8">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                    className="w-full flex justify-center"
                >
                    <SignUp
                        appearance={{
                            baseTheme: dark,
                            elements: {
                                card: "bg-black/40 backdrop-blur-xl border border-white/10 shadow-2xl rounded-[2rem]",
                                headerTitle: "text-2xl font-bold tracking-tight text-white",
                                headerSubtitle: "text-sm text-white/40",
                                socialButtonsBlockButton: "bg-white/5 border-white/10 hover:bg-white/10 text-white font-medium",
                                dividerLine: "bg-white/10",
                                dividerText: "text-white/20 uppercase tracking-wider text-[10px]",
                                formFieldLabel: "text-white/60 text-xs font-medium uppercase tracking-wider",
                                formFieldInput: "bg-white/5 border-white/10 text-white focus:border-accent/50 focus:bg-white/10 rounded-xl",
                                formButtonPrimary: "bg-accent hover:bg-accent/80 text-white font-bold rounded-xl transition-all active:scale-[0.98]",
                                footerActionText: "text-white/40",
                                footerActionLink: "text-white hover:text-accent font-medium",
                                identityPreviewText: "text-white",
                                identityPreviewEditButtonIcon: "text-white",
                            }
                        }}
                        signInUrl="/login"
                        forceRedirectUrl="/"
                    />
                </motion.div>

                {/* Back Link */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.8 }}
                    className="flex justify-center"
                >
                    <Link href="/" className="flex items-center gap-2 text-sm text-white/40 hover:text-white transition-colors">
                        <ArrowLeft className="h-4 w-4" />
                        Back to Timer
                    </Link>
                </motion.div>
            </div>
        </main>
    );
}
