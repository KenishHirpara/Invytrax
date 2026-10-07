"use client";

import { useTheme } from "@/components/theme-provider";
import { cn } from "@/lib/utils";
import { X, User, Mail, Save } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc";
import { useSession } from "next-auth/react";

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function EditProfileModal({ isOpen, onClose }: EditProfileModalProps) {
  const { data: session, update } = useSession();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  // Synchronize state with session when modal opens or session updates
  useEffect(() => {
    if (isOpen && session?.user) {
      setName(session.user.name ?? "");
      setEmail(session.user.email ?? "");
    }
  }, [isOpen, session]);

  const updateProfile = trpc.user.updateProfile.useMutation({
    onSuccess: async (data) => {
      // Update local session
      await update({
        ...session,
        user: {
          ...session?.user,
          name: data.name,
          email: data.email,
        },
      });
      onClose();
      window.location.reload(); // Quickest way to sync across components for now
    },
    onSettled: () => setLoading(false),
  });

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    updateProfile.mutate({ name, email });
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="w-full max-w-md bg-white dark:bg-card border border-gray-100 dark:border-border rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-foreground">Edit Profile</h2>
              <p className="text-sm text-gray-500 dark:text-muted-foreground mt-1">Update your personal information.</p>
            </div>
            <button 
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-muted rounded-full transition-colors text-gray-400"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-500 dark:text-muted-foreground uppercase tracking-widest pl-1">
                Full Name
              </label>
              <div className="relative group">
                <User className="absolute left-3 top-3 w-4 h-4 text-gray-400 group-focus-within:text-orange-500 transition-colors" />
                <Input 
                  value={name} 
                  onChange={(e) => setName(e.target.value)}
                  className="pl-10 h-11 border-gray-100 dark:border-border dark:bg-muted/50 focus-visible:ring-orange-500"
                  placeholder="Enter your name"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-500 dark:text-muted-foreground uppercase tracking-widest pl-1">
                Email Address
              </label>
              <div className="relative group">
                <Mail className="absolute left-3 top-3 w-4 h-4 text-gray-400 group-focus-within:text-orange-500 transition-colors" />
                <Input 
                  type="email"
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 h-11 border-gray-100 dark:border-border dark:bg-muted/50 focus-visible:ring-orange-500"
                  placeholder="Enter your email"
                  required
                />
              </div>
            </div>

            <div className="pt-4 flex gap-3">
              <Button 
                type="button" 
                variant="outline" 
                onClick={onClose}
                className="flex-1 h-11 font-semibold"
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={loading}
                className="flex-[1.5] h-11 bg-indigo-600 dark:bg-primary text-white dark:text-primary-foreground hover:bg-indigo-700 dark:hover:bg-primary/90 font-bold gap-2 shadow-lg shadow-orange-500/20"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Save Changes
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
