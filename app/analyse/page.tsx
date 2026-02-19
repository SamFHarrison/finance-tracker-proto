import { Avatar, AvatarFallback, H1, P } from '@/components/ui/primitives';

export default function Analyse() {
  return (
    <>
      <div className="flex px-4 justify-between items-end">
        <div>
          <P isSubtext>2026</P>
          <H1>February</H1>
        </div>

        <Avatar size="lg">
          <AvatarFallback>SF</AvatarFallback>
        </Avatar>
      </div>
    </>
  );
}
