import { ReactElement, JSXElementConstructor, ReactNode, ReactPortal, Key } from "react";
import { Message } from "semantic-ui-react";

interface Props {
    errors: any;
}

export default function ValidationError({errors}: Props) {
    return (
        <Message error>
            {errors && (
                <Message.List>
                    {errors.map((err: string | number | boolean | ReactElement<any, string | JSXElementConstructor<any>> | Iterable<ReactNode> | ReactPortal | null | undefined, i: Key | null | undefined) => (
                        <Message.Item key={i}>{err}</Message.Item>
                    ))}
                </Message.List>
            )}
        </Message>
    )
}