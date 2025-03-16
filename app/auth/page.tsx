"use client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useEffect, useState } from "react";
import { Fetch } from "@/middlewares/Fetch";
import { useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import { RootState } from "@/store";
import { AxiosError } from "axios";

const Page = () => {
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { isAuth, } = useSelector((state: RootState) => state.user) || {};
  
  const router = useRouter();
  
  useEffect(() => {
    if (isAuth) {
      router.push("/");
    }
  }, [router, isAuth]);

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
  
    try {
      const { data } = await Fetch.post("admin/login", {
        password,
        phoneNumber: +phone,
      });
      localStorage.setItem("token", data.token);
      
      window.location.href = "./";
    } catch (err: unknown) {
      if (err instanceof AxiosError) {
        const errorMessage =
          typeof err.response?.data === "string"
            ? err.response.data
            : JSON.stringify(err.response?.data ?? "Noma'lum xatolik yuz berdi");
        setError(errorMessage);
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Noma'lum xatolik yuz berdi");
      }
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="p-4 w-full h-screen flex items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-xl font-semibold">Tizimga kirish</CardTitle>
          <CardDescription>
            Telefon raqamingiz va parolingizni kiriting
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="phoneNumber">Telefon raqamingiz</Label>
              <Input
                id="phoneNumber"
                type="text"
                placeholder="991234567"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="password">Parol</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="********"
              />
            </div>
            {error && <p className="text-red-500 text-xs">{typeof error === "string" ? error : "Xatolik yuz berdi"}</p>}
            <Button className="w-full" disabled={isLoading} type="submit">
              {isLoading ? "Kirilmoqda..." : "Kirish"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Page;
