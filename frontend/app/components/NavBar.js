"use client";
import { CircleCheckBig, FolderKanban, User } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function NavBar() {
  const { user, isAuthenticated, logout, isAdmin } = useAuth();
  const [avatar,setAvatar] = useState(null)

  useEffect(() => {
    if (user && user.avatarUrl) { 
      setAvatar(user.avatarUrl);
    } else {
      setAvatar(null);
    }
  }, [user])

  return (
    <div className="navbar bg-base-100 shadow-sm">
      <div className="flex-1">
        <Link className="btn btn-ghost text-xl" href={`/`}>
          ToDo App
        </Link>
      </div>
      <div className="flex gap-2">
        {isAuthenticated && (
          <>
            <Link href={`/tasks`}>
              <CircleCheckBig />
            </Link>
            <Link href={`/projects`}>
              <FolderKanban />
            </Link>
          </>
        )}
        <div className="dropdown dropdown-end">
          <div
            tabIndex={0}
            role="button"
            className="btn btn-ghost btn-circle avatar"
          >
            <div className="w-10 rounded-full">
              {user ? (
                <img
                  alt="Tailwind CSS Navbar component"
                  src={
                    avatar !== null
                      ? avatar
                      : `https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fi.redd.it%2Fyw4bwkfqk9t71.jpg&f=1&nofb=1&ipt=b3cc8ad550d697106e0fe8d5189bc38e8c695254e13c4b095ccf8ff45c24acf3`
                  }
                />
              ) : (
                <User />
              )}
            </div>
          </div>
          <ul
            tabIndex={0}
            className="menu menu-sm dropdown-content bg-base-100 rounded-box z-1 mt-3 w-52 p-2 shadow"
          >
            {isAuthenticated ? (
              <>
                <li>
                  <Link className="justify-between" href={"/dashboard"}>
                    Profile
                  </Link>
                </li>
                {isAdmin() && (
                  <li>
                    <Link href={`/adminDashboard`}>Dashboard</Link>
                  </li>
                )}
                <li>
                  <button onClick={logout}>Logout</button>
                </li>
              </>
            ) : (
              <li>
                <Link href={`/login`}>Login</Link>
              </li>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}
