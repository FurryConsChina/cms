import { twMerge } from 'tailwind-merge';

export default function DefaultContainer(
  props: React.DetailedHTMLProps<
    React.HTMLAttributes<HTMLDivElement>,
    HTMLDivElement
  >,
) {
  const { children, className, ...reset } = props;
  return (
    <div
      {...reset}
      className={twMerge('shadow p-4 rounded-xl bg-white', className)}
    >
      {children}
    </div>
  );
}
