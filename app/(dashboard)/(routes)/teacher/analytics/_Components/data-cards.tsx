import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatPrice } from "@/lib/formet";
interface datacardsProps {
    value: number;
    label: string;
    shouldFormet?: boolean;
}
export const DataCard = ({ value, label, shouldFormet }: datacardsProps) => {
    return (
        <div>
            <Card>
                <CardHeader className="flex flex-row items-center  justify-between space-y-0 pb-2  ">
                    <CardTitle className=" text-sm font-medium ">
                        {label}
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">
                        {shouldFormet ? formatPrice(value) : value}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
