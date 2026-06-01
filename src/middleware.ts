import { NextResponse } from "next/server";
import { NextRequest } from "next/server";  

const PUBLIC_URL = ["/signin", "/register"];

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;
    console.log("🔥 Middleware running on:", pathname);
    const token =
    request.cookies.get("next-auth.session-token")?.value ||        // development
    request.cookies.get("__Secure-next-auth.session-token")?.value; 
    const isPublic_route = PUBLIC_URL.includes(pathname)


    if (!token && !isPublic_route){
        return NextResponse.redirect(new URL("/signin", request.url))
} 
if (token && isPublic_route && pathname !== "/"){
    return NextResponse.redirect(new URL("/dashboard", request.url))
}
return NextResponse.next();

}

export const config = {
    matcher: [
        '/((?!api|_next/static|favicon.ico).*)',
    ]
}
