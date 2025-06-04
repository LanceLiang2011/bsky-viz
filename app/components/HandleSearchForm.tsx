"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Loader2, Search, User } from "lucide-react";
import { useDebounce } from "../hooks/useDebounce";
import { searchBlueskyUsers, type BlueskyUser } from "../utils/blueskySearch";

export default function HandleSearchForm() {
  const t = useTranslations();
  const router = useRouter();
  const params = useParams();
  const [isLoading, setIsLoading] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [searchResults, setSearchResults] = useState<BlueskyUser[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  // Debounce the input value for API calls
  const debouncedInputValue = useDebounce(inputValue, 300);

  // Simple derived state for showing dropdown
  const showDropdown =
    isFocused && inputValue.length >= 2 && searchResults.length > 0;

  // Function to clean input in real-time, removing invisible characters but keeping @ symbol
  function cleanInput(value: string): string {
    return (
      value
        // Remove invisible Unicode characters that break URLs
        .replace(/[\u200B-\u200D\uFEFF\u202A-\u202E\u2066-\u2069]/g, "")
        // Remove other problematic invisible characters
        .replace(/[\u00AD\u034F\u061C\u180E\u2000-\u200A\u2028\u2029]/g, "")
        // Keep @ symbol and other visible characters
        .trim()
    );
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const cleanedValue = cleanInput(e.target.value);
    setInputValue(cleanedValue);
  }

  // Search for users when debounced input changes
  useEffect(() => {
    async function performSearch() {
      if (debouncedInputValue.length >= 2) {
        setIsSearching(true);
        try {
          const results = await searchBlueskyUsers(debouncedInputValue, 8);
          setSearchResults(results);
        } catch (error) {
          console.error("Search error:", error);
          setSearchResults([]);
        } finally {
          setIsSearching(false);
        }
      } else {
        setSearchResults([]);
        setIsSearching(false);
      }
    }

    performSearch();
  }, [debouncedInputValue]);

  function handleUserSelect(user: BlueskyUser) {
    // Clean handle (remove @ if present)
    const cleanHandle = user.handle.startsWith("@")
      ? user.handle.slice(1)
      : user.handle;

    setInputValue(cleanHandle);
    setIsFocused(false); // This will hide the dropdown
  }

    function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!inputValue.trim()) {
      return;
    }

    setIsLoading(true);
    setIsFocused(false); // Hide dropdown

    // Clean the handle for URL - remove @ symbol and ensure clean format
    let cleanHandle = inputValue.startsWith("@")
      ? inputValue.slice(1)
      : inputValue;
    cleanHandle = cleanHandle.replace(/\s+/g, "").toLowerCase();

    // Navigate to the dynamic route with locale (no limit parameter needed)
    const locale = params.locale || "en";
    router.push(`/${locale}/${cleanHandle}`);
  }

  return (
    <Card className="mx-auto max-w-md">
      <CardHeader>
        <CardTitle>{t("form.title")}</CardTitle>
        <CardDescription>{t("form.description")}</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <Input
              value={inputValue}
              onChange={handleInputChange}
              placeholder={t("form.placeholder")}
              required
              className="w-full pr-10"
              disabled={isLoading}
              onFocus={() => setIsFocused(true)}
              onBlur={(e) => {
                // Check if the blur is caused by clicking on a dropdown item
                const relatedTarget = e.relatedTarget as HTMLElement;
                if (
                  !relatedTarget ||
                  !relatedTarget.closest(".search-dropdown")
                ) {
                  setTimeout(() => setIsFocused(false), 150);
                }
              }}
            />
            {isSearching && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
              </div>
            )}

            {/* Simple dropdown without Popover complexity */}
            {showDropdown && (
              <div className="search-dropdown absolute top-full left-0 right-0 z-50 mt-1 bg-card border border-border rounded-md shadow-lg max-h-64 overflow-y-auto">
                {searchResults.length === 0 ? (
                  <div className="px-3 py-2 text-sm text-muted-foreground">
                    {isSearching ? "Searching..." : "No users found"}
                  </div>
                ) : (
                  searchResults.map((user) => (
                    <button
                      key={user.did}
                      type="button"
                      onClick={() => handleUserSelect(user)}
                      className="w-full flex items-center gap-3 p-3 hover:bg-accent transition-colors text-left border-b border-border last:border-b-0"
                    >
                      {user.avatar ? (
                        <Image
                          src={user.avatar}
                          alt={user.displayName || user.handle}
                          width={32}
                          height={32}
                          className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                          <User className="w-4 h-4 text-muted-foreground" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm truncate text-foreground">
                          {user.displayName || user.handle}
                        </div>
                        <div className="text-xs text-muted-foreground truncate">
                          {user.handle}
                        </div>
                      </div>
                    </button>
                  ))
                )}
              </div>
            )}
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {t("form.loading")}
              </>
            ) : (
              <>
                <Search className="mr-2 h-4 w-4" />
                {t("form.button")}
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
