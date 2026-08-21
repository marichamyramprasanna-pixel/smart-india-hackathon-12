import React from 'react'
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from '../common/Accordion'
import { Card, CardHeader, CardTitle, CardContent } from '../common/Card'
import { productConfig } from '../../config/productConfig'
import { HelpCircle } from 'lucide-react'

export const FAQAccordion: React.FC = () => {
  return (
    <Card variant="cyber" className="rounded-xl overflow-hidden shadow-2xl">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <HelpCircle className="h-4 w-4 text-cyan-400" />
          <CardTitle className="text-sm">Frequently Asked Technical Questions</CardTitle>
        </div>
        <p className="text-xs text-slate-400">
          Core concepts, behavioral algorithms, explainability models, and integration mechanisms.
        </p>
      </CardHeader>
      <CardContent>
        <Accordion type="single" collapsible className="w-full">
          {productConfig.faq.map((item, idx) => (
            <AccordionItem key={idx} value={`item-${idx}`}>
              <AccordionTrigger className="text-xs sm:text-sm font-semibold text-slate-200 hover:text-cyan-300">
                {item.question}
              </AccordionTrigger>
              <AccordionContent className="text-slate-300 text-xs sm:text-sm leading-relaxed">
                {item.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </CardContent>
    </Card>
  )
}
