import TabBar from "@/components/blocks/TabBar";

export default function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      {children}
      <TabBar />
    </>
  );
}
