"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { signOut } from "@/actions/auth";
import { checkIsAdmin } from "@/actions/admin";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Compass, LogOut, Settings, Wrench } from "lucide-react";
import Link from "next/link";
import type { User } from "@supabase/supabase-js";

export function UserMenu() {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
      if (data.user) {
        checkIsAdmin().then(setIsAdmin);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        checkIsAdmin().then(setIsAdmin);
      } else {
        setIsAdmin(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  if (!user) {
    return (
      <Button variant="outline" size="sm" asChild>
        <Link href="/login">Sign In</Link>
      </Button>
    );
  }

  const initials = user.email?.slice(0, 2).toUpperCase() ?? "U";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Avatar className="h-8 w-8">
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem asChild>
          <Link href={isAdmin ? "/tools" : "/adventure"}>
            {isAdmin ? (
              <><Wrench className="mr-2 h-4 w-4" /> Tools</>
            ) : (
              <><Compass className="mr-2 h-4 w-4" /> Adventure</>
            )}
          </Link>
        </DropdownMenuItem>
        {isAdmin && (
          <DropdownMenuItem asChild>
            <Link href="/admin/tools">
              <Settings className="mr-2 h-4 w-4" /> Admin
            </Link>
          </DropdownMenuItem>
        )}
        <DropdownMenuItem
          onClick={async () => {
            await signOut();
          }}
        >
          <LogOut className="mr-2 h-4 w-4" /> Sign Out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
