"use client";

import { useTranslations } from "next-intl";
import { getAvatarFallbackChar } from "@/app/utils/avatarUtils";
import Image from "next/image";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Calendar,
  ExternalLink,
  Heart,
  MessageCircle,
  Users,
} from "lucide-react";

interface BlueskyProfile {
  did: string;
  handle: string;
  displayName?: string;
  avatar?: string;
  banner?: string;
  description?: string;
  followersCount: number;
  followsCount: number;
  postsCount: number;
  createdAt: string;
  associated?: {
    lists: number;
    feedgens: number;
    starterPacks: number;
    labeler: boolean;
  };
  pinnedPost?: {
    cid: string;
    uri: string;
  };
}

interface ProfileCardProps {
  profile: BlueskyProfile;
}

export default function ProfileCard({ profile }: ProfileCardProps) {
  const t = useTranslations("profile");

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + "M";
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + "K";
    }
    return num.toString();
  };

  const handleViewProfile = () => {
    window.open(`https://bsky.app/profile/${profile.handle}`, "_blank");
  };

  const handleViewPinnedPost = () => {
    if (profile.pinnedPost) {
      // Convert AT URI to Bluesky URL format
      const postId = profile.pinnedPost.uri.split("/").pop();
      window.open(
        `https://bsky.app/profile/${profile.handle}/post/${postId}`,
        "_blank"
      );
    }
  };

  return (
    <Card className="max-w-2xl mx-auto overflow-auto shadow-lg border-0 bg-gradient-to-br from-background to-muted overflow-hiddenß">
      {/* Banner */}
      {profile.banner ? (
        <div className="h-32 bg-gradient-to-r from-blue-400 to-purple-500 relative">
          <Image
            src={profile.banner}
            alt="Profile banner"
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
          <div className="absolute inset-0 bg-black/10"></div>
        </div>
      ) : (
        <div className="h-32 bg-gradient-to-r from-blue-500 to-purple-600"></div>
      )}

      <CardHeader className="relative pb-4">
        <div className="flex items-start gap-4">
          {/* Avatar */}
          <div className="-mt-16 relative z-10">
            <div className="w-24 h-24 rounded-full border-4 border-background bg-background shadow-lg overflow-hidden">
              {profile.avatar ? (
                <Image
                  src={profile.avatar}
                  alt={profile.displayName || profile.handle}
                  width={96}
                  height={96}
                  className="object-cover"
                  sizes="96px"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold">
                  {getAvatarFallbackChar(profile.displayName, profile.handle)}
                </div>
              )}
            </div>
          </div>

          {/* Profile Info */}
          <div className="flex-1 min-w-0 pt-2">
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-xl font-bold text-foreground truncate">
                {profile.displayName || profile.handle}
              </h1>
            </div>
            <p className="text-muted-foreground text-sm">@{profile.handle}</p>

            {/* Member since */}
            <div className="flex items-center gap-1 mt-2 text-sm text-muted-foreground">
              <Calendar className="w-4 h-4" />
              <span>
                {t("memberSince")} {formatDate(profile.createdAt)}
              </span>
            </div>
          </div>

          {/* View Profile Button */}
          <Button
            onClick={handleViewProfile}
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
          >
            <ExternalLink className="w-4 h-4" />
          </Button>
        </div>

        {/* Description */}
        {profile.description && (
          <div className="mt-4">
            <p className="text-foreground whitespace-pre-line text-sm leading-relaxed">
              {profile.description}
            </p>
          </div>
        )}
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center p-4 bg-gradient-to-br from-primary/10 to-primary/20 rounded-xl border border-primary/20 hover:shadow-md transition-all duration-200">
            <div className="flex items-center justify-center gap-1 mb-2">
              <MessageCircle className="w-5 h-5 text-primary" />
            </div>
            <div className="text-2xl font-bold text-foreground">
              {formatNumber(profile.postsCount)}
            </div>
            <div className="text-sm text-muted-foreground font-medium">
              {t("posts")}
            </div>
          </div>

          <div className="text-center p-4 bg-gradient-to-br from-green-500/10 to-green-500/20 rounded-xl border border-green-500/20 hover:shadow-md transition-all duration-200">
            <div className="flex items-center justify-center gap-1 mb-2">
              <Users className="w-5 h-5 text-green-600" />
            </div>
            <div className="text-2xl font-bold text-foreground">
              {formatNumber(profile.followsCount)}
            </div>
            <div className="text-sm text-muted-foreground font-medium">
              {t("following")}
            </div>
          </div>

          <div className="text-center p-4 bg-gradient-to-br from-red-500/10 to-red-500/20 rounded-xl border border-red-500/20 hover:shadow-md transition-all duration-200">
            <div className="flex items-center justify-center gap-1 mb-2">
              <Heart className="w-5 h-5 text-red-600" />
            </div>
            <div className="text-2xl font-bold text-foreground">
              {formatNumber(profile.followersCount)}
            </div>
            <div className="text-sm text-muted-foreground font-medium">
              {t("followers")}
            </div>
          </div>
        </div>

        {/* Additional Stats */}
        {profile.associated && (
          <div className="grid grid-cols-2 gap-4">
            <div className="flex justify-between items-center p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200 hover:shadow-md transition-all duration-200">
              <span className="text-sm font-semibold text-blue-900">
                {t("lists")}
              </span>
              <span className="text-xl font-bold text-blue-700">
                {profile.associated.lists}
              </span>
            </div>

            <div className="flex justify-between items-center p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-200 hover:shadow-md transition-all duration-200">
              <span className="text-sm font-semibold text-purple-900">
                {t("feedGens")}
              </span>
              <span className="text-xl font-bold text-purple-700">
                {profile.associated.feedgens}
              </span>
            </div>
          </div>
        )}

        {/* Pinned Post */}
        {profile.pinnedPost && (
          <div className="border-t pt-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-foreground">
                {t("pinnedPost")}
              </h3>
              <Button
                onClick={handleViewPinnedPost}
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
              >
                <ExternalLink className="w-3 h-3" />
                {t("viewPost")}
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
