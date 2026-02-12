import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { H1, P } from '@/components/ui/typography';

export default function Page() {
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
