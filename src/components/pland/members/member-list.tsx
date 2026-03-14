"use client";

import { useTransition, useState } from "react";
import { Plus, Trash2, Users } from "lucide-react";
import { toast } from "sonner";
import type { PlandMember } from "@/lib/types";
import { removeMember } from "@/actions/pland";
import { Button } from "@/components/ui/button";
import { MemberAvatar } from "@/components/pland/members/member-avatar";
import { MemberForm } from "@/components/pland/members/member-form";

interface MemberListProps {
  members: PlandMember[];
  isAuthenticated: boolean;
  tripId: string;
  onMembersChange: () => void;
}

export function MemberList({
  members,
  isAuthenticated,
  tripId,
  onMembersChange,
}: MemberListProps) {
  const [formOpen, setFormOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleRemove(memberId: string) {
    startTransition(async () => {
      const result = await removeMember(memberId);
      if ("error" in result) {
        toast.error(result.error);
        return;
      }
      toast.success("Member removed");
      onMembersChange();
    });
  }

  return (
    <div className="rounded-lg border p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4 text-muted-foreground" />
          <h3 className="text-sm font-semibold">
            Members ({members.length})
          </h3>
        </div>
        {isAuthenticated && (
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => setFormOpen(true)}
          >
            <Plus className="h-3.5 w-3.5" />
          </Button>
        )}
      </div>

      <div className="mt-3 space-y-2">
        {members.length === 0 ? (
          <p className="text-xs text-muted-foreground">No members yet.</p>
        ) : (
          members.map((member) => (
            <div
              key={member.id}
              className="flex items-center justify-between gap-2"
            >
              <div className="flex items-center gap-2 overflow-hidden">
                <MemberAvatar
                  name={member.name}
                  color={member.avatar_color}
                  size="sm"
                />
                <span className="truncate text-sm">{member.name}</span>
              </div>
              {isAuthenticated && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 shrink-0 text-muted-foreground hover:text-destructive"
                  onClick={() => handleRemove(member.id)}
                  disabled={isPending}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              )}
            </div>
          ))
        )}
      </div>

      <MemberForm
        tripId={tripId}
        open={formOpen}
        onOpenChange={setFormOpen}
        onSuccess={() => {
          setFormOpen(false);
          onMembersChange();
        }}
      />
    </div>
  );
}
